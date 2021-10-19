import config from 'config';
import express from 'express';
import helmet from 'helmet';

import { rateLimiter } from '@middlewares';

const jsonParser = express.json();

/**
 * Adds helmet and request rate limiting middlewares in production environment.
 */

export default function registerPreprocessor(app) {
	if (config.util.getEnv('NODE_ENV') === 'production') {
		app.use(helmet());
		app.use(rateLimiter);
	}

	app.use(jsonParser);
}
