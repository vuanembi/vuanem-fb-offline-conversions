import get from '../db/bigquery';
import { SalesOrderData, OfflineConversionData } from './facebook';
import upload from './facebookRepo';

const EVENT_SET_ID = 1677017575826990;

const transform = (rows: SalesOrderData[]): OfflineConversionData => ({
    upload_tag: 'store_data',
    data: rows.map((row) => ({
        match_keys: {
            phone: [row['CUSTOMER_PHONE']],
        },
        currency: 'VND',
        value: row['NET_AMOUNT'],
        event_name: 'Purchase',
        event_time: row['TRANDATE'],
        order_id: row['TRANID'],
        custom_data: { event_source: 'in_store' },
    })),
});

const offlineConversionService = ({ day }: { day?: number }) =>
    get(day || 1)
        .then(transform)
        .then(upload(EVENT_SET_ID));

export default offlineConversionService;
