import config from 'config';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { logger } from '@tools';
import { obtainTokenFromRequest, prettyJson } from '@utilities';

const JWT_AUTH_SECRET = config.get('jwtAuthSecret');

/**
 * Allows only (401) authenticated users to access routes
 * @requires jwt on auth header in BEARER <token> format
 * @mounts user object onto req object
 */
export default async (req, res, next) => {
	if (req.isSAU) return next();

	const token = obtainTokenFromRequest(req);
	if (!token) {
		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing authorization header' });
	}

	try {
		const payload = jwt.verify(token, JWT_AUTH_SECRET);
		logger.silly('Middleware(authorization) Token payload: ' + prettyJson(payload));
		req.user = payload; // has id, display_name, email, ? unverified
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token expired' });
		}

		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
	}

	next();
};
