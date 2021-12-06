/* eslint-disable */
// @ts-ignore
let functions = require('firebase-functions');

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

let searlesServer: any;

// @ts-ignore
exports.searles = functions.region('us-central1').https.onRequest(async (request, response) => {
	if (!searlesServer) {
		functions.logger.info('Initialising SvelteKit SSR entry'); // @ts-ignore
		searlesServer = require('./searles/index').default; 
		functions.logger.info('SvelteKit SSR entry initialised!');
	}
	functions.logger.info('Requested resource: ' + request.originalUrl);
	return searlesServer(request, response);
});
