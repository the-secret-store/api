import { StatusCodes } from 'http-status-codes';
import { OTP, User } from '@models';
import logger from '@tools/logging';
import { generateOTP, sendMail } from '@utilities';

/**
 * Send OTP to an authorized user
 *
 * @route: /verify/get-otp
 * @method: get
 * @requires: header { authorization: 'Bearer <token>' }
 * @returns: 200 | 400 | 401 | 500
 */

export const sendOTP = async (req, res) => {
	// 1. get user details //* use authorization middleware
	const { id: character_id, email } = req.user;

	// 2. generate otp and save to database (update if already exist)
	const otp = generateOTP();
	logger.debug('OTP: ' + otp);
	await OTP.updateOne({ character_id }, { otp }, { upsert: true });

	// 3. send the otp
	try {
		logger.debug('Sending OTP to ' + email);
		await sendMail(
			email,
			'The secret store account verification',
			`Your verification code is: ${otp}`
		);
		logger.debug('Email sent');
		res.status(StatusCodes.OK).json({ message: 'Verification code sent successfully' });
	} catch (err) {
		// if there was an error, delete the saved otp document
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message:
				'Could not send verification code, this could also be due to an invalid email address'
		});
		logger.error(err.stack);
		OTP.deleteOne({ character_id });
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

	// 2. check the otp
	if (otp.toString().length !== 6) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid verification code' });
	}
	const result = await OTP.findOne({ character_id, otp });
	if (!result) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid verification code' });
	}

	// 3. set the account as verified and delete the otp document
	await User.findByIdAndUpdate(character_id, { $set: { is_verified: true } });
	res.status(StatusCodes.OK).json({ message: 'Account verified successfully' });
	OTP.deleteOne({ character_id });
};
