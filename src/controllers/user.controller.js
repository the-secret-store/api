import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { User, validateUser } from '@models';
import { logger } from '@tools';
import { prettyJson } from '@utilities';
import { validatePasswordChange } from '@validation';

/**
 * Controller for /user
 *
 * Available controllers: registerUser
 */

const SALT_ROUNDS = 5;

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
		const salt = await bcrypt.genSalt(SALT_ROUNDS);
		const hashed = await bcrypt.hash(body.password, salt);

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

/**
 * Change password
 *
 * @route: /user/changePassword
 * @method: POST
 * @requires: body { currentPassword, newPassword, newPasswordConfirmation }, header {authorization}
 * @returns: 200 | 400 | 403 | 500
 */
export const changePassword = async (req, res) => {
	const {
		body,
		user: { id: userId }
	} = req;

	logger.debug('Acknowledged: ' + prettyJson(body));

	// 1. validate the request
	const { error } = validatePasswordChange({ ...body, userId });
	if (error) {
		logger.debug(prettyJson(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error });
	}

	// 2. authenticate the user yet again (although we're using auth middlewares)
	const user = await User.findById(userId);
	const authenticated = await bcrypt.compare(body.currentPassword, user.password);
	if (!authenticated) {
		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Wrong password' });
	}

	// 3. update the password
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash(body.newPassword, salt);

	user.password = hashedPassword;
	await user.save();

	logger.debug('Updated password');
	res.status(StatusCodes.OK).json({ message: 'Password updated successfully' });
};
