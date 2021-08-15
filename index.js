require('dotenv').config();
const moment = require('moment');
const { BigQuery } = require('@google-cloud/bigquery');
const axios = require('axios');

const bqClient = new BigQuery();

const OFFLINE_EVENT_SET_IDS = [
  // 872584219808166,
  1677017575826990,
];

const get = async (day) => {
  const date = moment().utc().subtract(day, 'days');
  const query = `SELECT * FROM NetSuite.vn_FacebookOfflineConversions
    WHERE DATE(TIMESTAMP_SECONDS(TRANDATE)) = @TRANDATE`;
  const queryOptions = {
    query,
    params: { TRANDATE: date.format('YYYY-MM-DD') },
  };
  const [rows] = await bqClient.query(queryOptions);
  return rows;
};

const transform = (rows) => {
  const rowsData = rows.map((row) => ({
    match_keys: {
      phone: [row['CUSTOMER_PHONE']],
    },
    currency: 'VND',
    value: row['NET_AMOUNT'],
    event_name: 'Purchase',
    event_time: row['TRANDATE'],
    order_id: row['TRANID'],
    custom_data: { event_source: 'in_store' },
  }));
  return {
    upload_tag: 'store_data',
    data: rowsData,
  };
};

const push = async (rowsData) => {
  const params = { access_token: process.env.ACCESS_TOKEN };
  const res = Promise.all(
    OFFLINE_EVENT_SET_IDS.map(async (eventSetId) => {
      try {
        const res = await axios.post(
          `https://graph.facebook.com/${process.env.API_VER}/${eventSetId}/events`,
          rowsData,
          {
            params,
          },
        );
        return await res.data;
      } catch (err) {
        console.log(err);
      }
    }),
  );
  return await res;
};

const run = async (day = 1) => {
  const rows = await get(day);
  const rowsData = transform(rows);
  return await push(rowsData);
};

exports.main = async (req, res) => {
  const day = req.day;
  const responses = {
    pipelines: 'FacebookOfflineConversions',
    results: await run(day),
  };
  await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: JSON.stringify(responses, null, 2),
    },
  );
  console.log(responses);
  res.send(responses);
};
