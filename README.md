# atlas backend

Backend for the @tlas (codename) project.

## Setup

1. Run `asdf install` to install the correct nodejs version
2. Run `npm install` to install npm dependencies
3. Add the required environment variables in a `.env` file

## Development

To call a function locally, run `serverless invoke local -f <function-name> -d <data-to-pass>`.

For example run: `serverless invoke local -f openaiRequest -d '{"prompt":"a car infront of the eiffel tower"}'`

To use a local dev server to which you can invoke the functions via http, run `npm run local_dev_server`, for examples on how to call the functions see the [samples.http](samples.http) file.
