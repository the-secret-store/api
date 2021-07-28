import express from 'express';
import 'dotenv/config';
import config from 'config';

import {
	connectDB,
	registerListener,
	registerLogging,
	registerPreprocessor,
	registerRouters,
	setupDocs,
	verifyMailConnection
} from '@tools';

const PORT = config.get('port');
const HOST = config.get('host');

const app = express();

registerLogging(app);
registerPreprocessor(app);
setupDocs(app);
registerRouters(app);
connectDB();
verifyMailConnection();

const server = registerListener(app, PORT, HOST);
module.exports = server;
