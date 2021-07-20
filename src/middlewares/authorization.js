import jwt from 'jsonwebtoken';
import config from 'config';
import { StatusCodes } from 'http-status-codes';

const TOKEN_PRIVATE_KEY = config.get('secretKey');

function obtainTokenFromHeader(authHeader) {
	return authHeader?.split(' ')[1];
}

export const authorize = (req, res, next) => {
	const { authorization } = req.headers;
	if (!authorization) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Missing authorization header' });
	}

	const token = obtainTokenFromHeader(authorization);
	const payload = jwt.verify(token, TOKEN_PRIVATE_KEY);
	req.user = payload;
	next();
};
