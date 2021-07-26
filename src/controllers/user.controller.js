import bcryptjs from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import logger from '@tools/logging';
import { User, validateUser } from '@models';
import { prettyJson } from '@utilities';

/**
 * Controller for /user
 *
 * Available controllers: registerUser
 */

/**
 * Register a new user
 *
 * @route: /user/register
 * @method: POST
 * @requires: body { displayName, email, password, teams?, projects? }
 * @returns: 200 | 400 | 500
 */

export const registerUser = async (req, res) => {
	const { body } = req;
	logger.debug('Acknowledged: ' + prettyJson(body));

	try {
		// 1. validate the user object
		const { error } = validateUser(body);
		if (error) {
			logger.debug(prettyJson(error));
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: error.details[0].message, details: error });
		}

		// 2. hash the password
		const salt = await bcryptjs.genSalt(5);
		const hashed = await bcryptjs.hash(body.password, salt);

		// 3. create the user document
		const theNewUser = new User({ ...body, password: hashed });
		const {
			// eslint-disable-next-line no-unused-vars
			_doc: { password, __v, ...userDoc }
		} = await theNewUser.save();

		logger.debug('Registration successful.');
		return res.status(StatusCodes.OK).json({ message: 'Successfully registered', data: userDoc });
	} catch (err) {
		// MongoError: Unique key violation
		if (err.code === 11000) {
			const errorKeys = Object.keys(err.keyPattern);
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: `${body[errorKeys[0]]} is already registered`, details: err });
		}

		// Probably some other error (i don't remember)
		if (err.name === 'ValidationError') {
			logger.debug(err);
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: err.message, details: err.errors });
		}

		throw err;
	}
};
