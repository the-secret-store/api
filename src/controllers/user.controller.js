import logger from '@tools/logging';
import { StatusCodes } from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import { User, validateUser } from '@models';

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
	logger.debug('Acknowledged: ' + JSON.stringify(body));

	try {
		const { error } = validateUser(body);
		if (error) {
			logger.debug(JSON.stringify(error));
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: error.details[0].message, details: error });
		}

		const salt = await bcryptjs.genSalt(5);
		const hashed = await bcryptjs.hash(body.password, salt);
		const theNewUser = new User({ ...body, password: hashed });
		const {
			// eslint-disable-next-line no-unused-vars
			_doc: { password, __v, ...userDoc }
		} = await theNewUser.save();

		logger.debug('Registration successful.');
		return res.status(StatusCodes.OK).json({ message: 'Successfully registered', data: userDoc });
	} catch (err) {
		if (err.code === 11000) {
			const errorKeys = Object.keys(err.keyPattern);
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: `${body[errorKeys[0]]} is already registered`, details: err });
		}
		if (err.name === 'ValidationError') {
			logger.debug(err);
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: err.message, details: err.errors });
		}

		logger.error(err.stack);
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: 'Could not complete registration', details: err });
	}
};
