/* eslint-disable @typescript-eslint/no-var-requires */
const app = require('./index.js');
const http = require('http');

// creates server for plesk
http.createServer(app).listen(3000);
