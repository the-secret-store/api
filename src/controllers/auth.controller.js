import bcrypt from 'bcryptjs';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { User } from '@models';
import { logger } from '@tools';
import { prettyJson, obtainTokenFromRequest } from '@utilities';
import { validateAuthRequest } from '@validation';

/**
 * Controller for /auth
 *
 * Available controllers: login, checkAuth
 */

const JWT_AUTH_SECRET = config.get('jwtAuthSecret');
const JWT_REFRESH_SECRET = config.get('jwtRefreshSecret');

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
	logger.silly('Controller(auth, login) | Ack: ' + prettyJson({ email, password }));

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
	const authToken = jwt.sign(payload, JWT_AUTH_SECRET, { expiresIn: '15m' });
	const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '365d' });

	return res.status(StatusCodes.OK).json({
		message: `Logged in as ${display_name}`,
		tokens: { authToken, refreshToken },
		token_format: 'Bearer'
	});
};

/**
 * Check if the user is authorized to perform operations
 * I don't know what is the use of this controller, but I'm keeping it for now
 * @route: /auth/check
 * @method: POST
 * @requires: headers {authorization}
 * @returns: 200 | 401
 */
export const checkAuth = async (req, res) => {
	// make sure to use authorize middleware
	logger.silly(`Controller(auth, check) | Ack: ${prettyJson(req.user)}`);
	if (req.user) {
		return res.status(StatusCodes.OK).json({ message: 'Authorized', data: req.user });
	}

	return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Not authorized' });
};

/**
 * Get a new refresh-auth token pair
 * @route: /auth/get-new-tokens
 * @method: PUT
 * @requires: headers {authorization} (refreshToken)
 * @returns: 200 | 401 | 500
 */
export const getNewTokenPair = async (req, res) => {
	const oldRefreshToken = obtainTokenFromRequest(req);

	try {
		const { id } = jwt.decode(oldRefreshToken);
		const { refreshTokens } = await User.findById(id, { refreshTokens: 1 });

		if (!refreshTokens.includes(oldRefreshToken)) {
			throw new Error('Invalid token');
		}

		const payload = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET);
		const newAuthToken = jwt.sign(payload, JWT_AUTH_SECRET);
		const newRefreshToken = jwt.sign(payload, JWT_REFRESH_SECRET);
		await User.findByIdAndUpdate(id, {
			$set: {
				refreshTokens: { ...refreshTokens.filter(t => t !== oldRefreshToken), newRefreshToken }
			}
		});
		req.user = payload;

		return res.status(201).json({
			message: 'New tokens generated',
			tokens: { authToken: newAuthToken, refreshToken: newRefreshToken }
		});
	} catch (err) {
		return res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid token' });
	}
};
