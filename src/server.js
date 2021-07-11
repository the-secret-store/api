import express from 'express';
import 'dotenv/config';
import config from 'config';

import {
	checkEnv,
	connectDB,
	registerListener,
	registerLogging,
	registerPreprocessor,
	registerRouters,
	setupDocs
} from '@tools';

const PORT = config.get('port');
const HOST = config.get('host');

const app = express();

registerLogging(app);
checkEnv();
registerPreprocessor(app);
setupDocs(app);
registerRouters(app);
connectDB();

const server = registerListener(app, PORT, HOST);
module.exports = server;
