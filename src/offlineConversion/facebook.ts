export type SalesOrderData = {
    event_time: number;
    phone: string;
    order_id: string;
    value: number;
};

export type OfflineConversionData = {
    upload_tag: 'store_data';
    data: {
        match_keys: {
            phone: string[];
        };
        currency: 'VND';
        value: number;
        event_name: 'Purchase';
        event_time: number;
        order_id: string;
        custom_data: {
            event_source: 'in_store';
        };
    }[];
};
