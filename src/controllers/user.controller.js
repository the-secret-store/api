import logger from '@tools/logging';
import { StatusCodes } from 'http-status-codes';
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
		const theNewUser = new User(body);
		const userDoc = await theNewUser.save();

		logger.debug('Registration successful.');
		return res.status(StatusCodes.OK).json({ message: 'Successfully registered', data: userDoc });
	} catch (err) {
		if (err.code === 11000) {
			const errorKeys = Object.keys(err.keyPattern);
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: `${body[errorKeys[0]]} is already registered`, error: err });
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
			.json({ message: 'Could not complete registration', error: err });
	}
};
