declare const buildResponse: (body: any, statusCode?: number) => {
    statusCode: number;
    headers: {
        'Access-Control-Allow-Origin': string;
    };
    body: string;
};
export default buildResponse;
