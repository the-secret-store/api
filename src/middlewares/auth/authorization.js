import jwt from 'jsonwebtoken';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import logger from '@tools/logging';
import { prettyJson } from '@utilities';

const TOKEN_PRIVATE_KEY = config.get('secretKey');

/**
 * Obtains token from auth header
 * @param authHeader in BEARER <token> format
 * @returns JWT token
 */
function obtainTokenFromHeader(authHeader) {
	return authHeader?.split(' ')[1];
}

/**
 * Allows only authenticated users to access routes
 * @requires jwt on auth header in BEARER <token> format
 * @mounts user object onto req object
 */
export default (req, res, next) => {
	const { authorization } = req.headers;
	if (!authorization) {
		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing authorization header' });
	}

	const token = obtainTokenFromHeader(authorization);
	const payload = jwt.verify(token, TOKEN_PRIVATE_KEY);
	logger.debug('Token payload: ' + prettyJson(payload));
	req.user = payload; // has id, display_name, email, ? unverified
	next();
};
