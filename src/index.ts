import { HttpFunction } from '@google-cloud/functions-framework';

import offlineConversionService from './offlineConversion/offlineConversionService';

type Body = {
    day?: number;
};

export const main: HttpFunction = (req, res) => {
    const { body }: { body: Body } = req;

    console.log(body);

    offlineConversionService(body).then((num) => {
        console.log(num);
        res.status(200).send({num});
        return
    });
};
