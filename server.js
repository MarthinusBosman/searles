/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('./index.js');
const http = require('http');

http.createServer(app).listen(3000);
