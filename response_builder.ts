const buildResponse = (body: object, statusCode: number = 200) => {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        },
        body: JSON.stringify(body),
    }
}

module.exports = buildResponse;
