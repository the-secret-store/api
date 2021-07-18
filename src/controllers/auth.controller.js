import bcrypt from 'bcryptjs';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import User from '@models/user.model';
import logger from '@tools/logging';
import validateAuthRequest from '@validation/auth.validation';

/**
 * Controller for /user
 *
 * Available controllers: registerUser
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
	logger.debug('Acknowledged: ' + { email, password });

	// check if given credentials meet user validation, if it doesn't, we can avoid db read req
	const { error } = validateAuthRequest({ email, password });
	if (error) {
		logger.debug(JSON.stringify(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error });
	}

	// find if the user exist
	const user = await User.findOne({ email });
	if (!user) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'Email does not exist in out records.'
		});
	}

	// now compare the given and actual password
	const authenticated = await bcrypt.compare(password, user.password);
	if (!authenticated) {
		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Wrong password' });
	}

	// synthesize a token and send it
	const { id, displayName } = user;
	const token = jwt.sign({ id, displayName }, TOKEN_PRIVATE_KEY);
	return res
		.status(StatusCodes.ACCEPTED)
		.json({ message: 'Authenticated successfully', token, token_type: 'Bearer' });
};
