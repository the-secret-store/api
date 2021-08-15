import express from 'express';
import 'dotenv/config';
import config from 'config';
import checkEnv from '@tools/checkEnv';

import {
	connectDB,
	handleServerErrors,
	registerListener,
	registerLogging,
	registerPreprocessor,
	registerRouters,
	setupDocs,
	verifyMailConnection
} from '@tools';

const PORT = config.get('port');
const HOST = config.get('host');

function spinServer(port, host) {
	const app = express();

	checkEnv();
	registerLogging(app);
	registerPreprocessor(app);
	setupDocs(app);
	registerRouters(app);
	connectDB();
	verifyMailConnection();
	handleServerErrors(app);

	return registerListener(app, port, host);
}

module.exports = spinServer(PORT, HOST);
