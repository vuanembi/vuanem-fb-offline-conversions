import os
import json
from datetime import datetime, timedelta

import requests
from google.cloud import bigquery


class FBOfflineConversionJob:
    def __init__(self, day):
        self.OFFLINE_EVENT_SET_ID = os.getenv("OFFLINE_EVENT_SET_ID")
        self.API_VER = os.getenv("API_VER")
        self.fetch_date = (datetime.now() - timedelta(days=day)).strftime("%Y-%m-%d")

    def fetch_data(self):
        client = bigquery.Client()
        rows = client.query(
            f"""SELECT
            UNIX_SECONDS(TIMESTAMP_ADD(TIMESTAMP(TRANDATE), INTERVAL 990 MINUTE)) AS TRANDATE,
            TO_HEX(SHA256(CUSTOMER_PHONE)) AS CUSTOMER_PHONE,
            TRANID,
            CAST(NET_AMOUNT AS INT64) AS NET_AMOUNT
            FROM NetSuite.SalesOrder
            WHERE TRANDATE = '{self.fetch_date}'
            AND CUSTOMER_PHONE IS NOT NULL
            """
        ).result()
        client.close()
        return [dict(zip(row.keys(), row.values())) for row in rows]

    def push(self, rows):
        mapper = lambda x: {
            "match_keys": {
                "phone": [x["CUSTOMER_PHONE"]]
            },
            "currency": "VND",
            "value": x["NET_AMOUNT"],
            "event_name": "Purchase",
            "event_time": x["TRANDATE"],
            "order_id": x["TRANID"],
            "custom_data": {"event_source": "in_store"},
        }
        rows = list(map(mapper, rows))
        
        with requests.post(
            "https://graph.facebook.com/{API_VER}/{OFFLINE_EVENT_SET_ID}/events".format(
                API_VER=os.getenv("API_VER"),
                OFFLINE_EVENT_SET_ID=os.getenv("OFFLINE_EVENT_SET_ID"),
            ),
            params={"access_token": os.getenv("ACCESS_TOKEN")},
            json={"upload_tag": "store_data", "data": rows},
        ) as r:
            res = r.json()
        res['date'] = self.fetch_date
        return {'date': self.fetch_date, **res}

    def run(self):
        rows = self.fetch_data()
        return self.push(rows)


def main(request):
    request_json = request.get_json()
    if request_json:
        day = request_json.get('day', 1)
    else:
        day = 1
    vuanem_fb_offline_conversion = FBOfflineConversionJob(day)
    responses = {
        'pipelines': 'Facebook Offline Conversions',
        'results': [vuanem_fb_offline_conversion.run()]
    }

    print(responses)

    _ = requests.post(
        "https://api.telegram.org/bot{token}/sendMessage".format(
            token=os.getenv("TELEGRAM_TOKEN")
        ),
        json={
            "chat_id": os.getenv("TELEGRAM_CHAT_ID"),
            "text": json.dumps(responses, indent=4),
        },
    )
    return responses

if __name__ == '__main__':
    main(0)
