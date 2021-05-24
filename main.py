import os
import json
from datetime import datetime, timedelta

import requests
from google.cloud import bigquery

OFFLINE_EVENT_SET_ID = os.getenv("OFFLINE_EVENT_SET_ID")
API_VER = os.getenv("API_VER")


class FBOfflineConversionJob:
    def __init__(self, day):
        self.fetch_date = (datetime.utcnow() - timedelta(days=day)).strftime("%Y-%m-%d")

    def fetch_data(self):
        client = bigquery.Client()
        query = f"""
            SELECT * FROM NetSuite.vn_FacebookOfflineConversions
            WHERE DATE(TIMESTAMP_SECONDS(TRANDATE)) = @TRANDATE
            """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("TRANDATE", "STRING", self.fetch_date),
            ]
        )
        rows = client.query(query, job_config=job_config).result()

        client.close()
        return [dict(row.items()) for row in rows]

    def transform(self, rows):
        mapper = lambda x: {
            "match_keys": {"phone": [x["CUSTOMER_PHONE"]]},
            "currency": "VND",
            "value": x["NET_AMOUNT"],
            "event_name": "Purchase",
            "event_time": x["TRANDATE"],
            "order_id": x["TRANID"],
            "custom_data": {"event_source": "in_store"},
        }
        return list(map(mapper, rows))

    def push(self, rows):
        url = f"https://graph.facebook.com/{API_VER}/{OFFLINE_EVENT_SET_ID}/events"
        with requests.post(
            url,
            params={"access_token": os.getenv("ACCESS_TOKEN")},
            json={"upload_tag": "store_data", "data": rows},
        ) as r:
            res = r.json()
        res["date"] = self.fetch_date
        return {"date": self.fetch_date, **res}

    def run(self):
        rows = self.fetch_data()
        rows
        rows = self.transform(rows)
        return self.push(rows)


def main(request):
    request_json = request.get_json()
    if request_json:
        day = request_json.get("day", 1)
    else:
        day = 1
    vuanem_fb_offline_conversion = FBOfflineConversionJob(day)
    responses = {
        "pipelines": "Facebook Offline Conversions",
        "results": [vuanem_fb_offline_conversion.run()],
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


if __name__ == "__main__":
    main(0)
