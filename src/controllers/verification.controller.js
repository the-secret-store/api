import { StatusCodes } from 'http-status-codes';
import config from 'config';
import { OTP, User } from '@models';
import { logger } from '@tools';
import { generateOTP, prettyJson, sendMail } from '@utilities';

/**
 * Controller for OTP - email verifications
 *
 * Available controllers: sendOTP, verifyAccount
 */

/**
 * Send OTP to an authorized user
 *
 * @route: /verify/get-otp
 * @method: get
 * @requires: header { authorization: 'Bearer <token>' }
 * @returns: 201 | 400 | 401 | 500
 */

export const sendOTP = async (req, res) => {
	// 1. get user details //* use authorization middleware
	const { id: character_id, email, unverified } = req.user;
	logger.silly(
		`Controller(verification, sendOtp) | Ack: ${prettyJson({ character_id, email, unverified })}`
	);

	// check for unverified property in auth payload (set only if is_verified is false),
	// if not present, close request as verified already
	if (!unverified) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Already verified' });
	}

	// 2. generate otp and save to database (update if already exist)
	const otp = generateOTP();
	logger.debug(`OTP: ${otp}`);
	await OTP.updateOne({ character_id }, { otp }, { upsert: true });

	// 3. send the otp
	try {
		logger.debug(`Sending OTP to ${email}`);
		await sendMail(
			email,
			'The secret store account verification',
			`Your verification code is: ${otp}`
		);
		logger.debug('Email sent');
		if (config.util.getEnv('NODE_ENV') === 'test') {
			return res
				.status(StatusCodes.OK)
				.json({ otp, message: 'Verification code sent successfully' });
		}
		res.status(StatusCodes.CREATED).json({ message: 'Verification code sent successfully' });
	} catch (err) {
		// if there was an error, delete the saved otp document
		logger.error(err.stack);
		await OTP.deleteOne({ character_id });
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message:
				'Could not send verification code, this could also be due to an invalid email address'
		});
	}
};

/**
 * Verify the account with otp
 *
 * @route: /verify/check
 * @method: get
 * @requires: header { authorization: 'Bearer <token>' }, body { otp }
 * @returns: 200 | 400 | 500
 */

export const verifyAccount = async (req, res) => {
	// 1. get user details and otp //* use authorization middleware
	const { id: character_id } = req.user;
	const { otp } = req.body;

	logger.silly(`Controller(verification, verify) | Ack: ${prettyJson({ character_id, otp })}`);

	// 2. check the otp
	if (!otp || otp.toString().length !== 6) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid verification code' });
	}
	const result = await OTP.findOne({ character_id });
	if (!result) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'No record found' });
	}
	if (result.otp !== otp) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid verification code' });
	}

	// 3. set the account as verified and delete the otp document
	await User.findByIdAndUpdate(character_id, { $set: { is_verified: true } });
	await OTP.deleteOne({ character_id });
	res.status(StatusCodes.OK).json({ message: 'Account verified successfully' });
};
