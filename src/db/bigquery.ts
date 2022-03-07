import 'dotenv/config';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BigQuery } from '@google-cloud/bigquery';

import { SalesOrderData } from '../offlineConversion/facebook';

dayjs.extend(utc);

const BQ_CLIENT = new BigQuery();

const get = async (day: number): Promise<SalesOrderData[]> => {
    const queryOptions = {
        query: `
        SELECT * FROM OP_Marketing.MK_OfflineConversion
        WHERE DATE(TIMESTAMP_SECONDS(TRANDATE)) = @TRANDATE
        `,
        params: {
            TRANDATE: dayjs.utc().subtract(day, 'day').format('YYYY-MM-DD'),
        },
    };
    const [rows] = await BQ_CLIENT.query(queryOptions);
    return rows;
};

export default get;
