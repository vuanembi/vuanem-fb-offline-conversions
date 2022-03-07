type TranDate = number;
type CustomerPhone = string;
type TranID = string;
type NetAmount = number;

export type SalesOrderData = {
    TRANDATE: TranDate;
    CUSTOMER_PHONE: CustomerPhone;
    TRANID: TranID;
    NET_AMOUNT: number;
};

export type OfflineConversionData = {
    upload_tag: 'store_data';
    data: {
        match_keys: {
            phone: CustomerPhone[];
        };
        currency: 'VND';
        value: NetAmount;
        event_name: 'Purchase';
        event_time: TranDate;
        order_id: TranID;
        custom_data: {
            event_source: 'in_store';
        };
    }[];
};
