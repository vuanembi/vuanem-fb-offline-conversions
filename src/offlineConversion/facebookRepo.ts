import axios from 'axios';

import { OfflineConversionData } from './facebook';

const API_VER = 'v13.0';
const CLIENT = axios.create({
    baseURL: `https://graph.facebook.com/${API_VER}`,
    params: { access_token: process.env.ACCESS_TOKEN || '' },
});

type UploadResponse = {
    num_processed_entries: number;
};

const upload = (eventSetId: number) => (data: OfflineConversionData) =>
    CLIENT.post<UploadResponse>(`/${eventSetId}/events`, data)
        .then(({ data: { num_processed_entries } }) => num_processed_entries)
        .catch(() => 0);

export default upload;
