const buildResponse = (body: any, statusCode: number = 200) => {
    body.success = statusCode < 400;
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        },
        body: JSON.stringify(body),
    }
}

export default buildResponse;
