import bcrypt from 'bcryptjs';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import User from '@models/user.model';
import logger from '@tools/logging';
import validateAuthRequest from '@validation/auth.validation';
import { prettyJson } from '@utilities';

/**
 * Controller for /user
 *
 * Available controllers: registerUser, checkAuth
 */

const TOKEN_PRIVATE_KEY = config.get('secretKey');

/**
 * Login using email and password
 *
 * @route: /auth/login
 * @method: POST
 * @requires: body { email, password }
 * @returns: 200 | 400 | 401 | 500
 */

export const login = async (req, res) => {
	const { email, password } = req.body;
	logger.debug('Acknowledged: ' + prettyJson({ email, password }));

	// 1. check if given credentials meet user validation, if it doesn't, we can avoid db query
	const { error } = validateAuthRequest({ email, password });
	if (error) {
		logger.debug(prettyJson(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error });
	}

	// 2. find if the user exist
	const user = await User.findOne({ email });
	if (!user) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'Email does not exist in out records.'
		});
	}

	// 3. now compare the given and actual password
	const authenticated = await bcrypt.compare(password, user.password);
	if (!authenticated) {
		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Wrong password' });
	}

	// 4. synthesize a token and send it
	const { id, display_name, is_verified } = user;
	const payload = { id, display_name, email };
	if (!is_verified) payload.unverified = true;
	const token = jwt.sign(payload, TOKEN_PRIVATE_KEY);
	return res
		.status(StatusCodes.OK)
		.json({ message: 'Authenticated successfully', token, token_type: 'Bearer' });
};

/**
 * Check if the user is authorized to perform operations
 *
 * @route: /auth/check
 * @method: POST
 * @requires: headers {authorization}
 * @returns: 200 | 401
 */

export const checkAuth = async (req, res) => {
	// make sure to use authorize middleware
	if (req.user) {
		return res.status(StatusCodes.OK).json({ message: 'Authorized', data: req.user });
	}

	return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized' });
};
