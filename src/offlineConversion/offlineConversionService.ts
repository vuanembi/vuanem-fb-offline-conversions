import get from '../db/bigquery';
import { SalesOrderData, OfflineConversionData } from './facebook';
import upload from './facebookRepo';

const EVENT_SET_ID = 1677017575826990;

const transform = (rows: SalesOrderData[]): OfflineConversionData => ({
    upload_tag: 'store_data',
    data: rows.map(({ event_time, phone, order_id, value }) => ({
        match_keys: { phone: [phone] },
        value,
        event_time,
        order_id,
        currency: 'VND',
        event_name: 'Purchase',
        custom_data: { event_source: 'in_store' },
    })),
});

const offlineConversionService = ({ day }: { day?: number }) =>
    get(day || 1)
        .then(transform)
        .then(upload(EVENT_SET_ID));

export default offlineConversionService;
