import { StatusCodes } from 'http-status-codes';
import OTP from '@models/otp.model';
import logger from '@tools/logging';
import { generateOTP, sendMail } from '@utilities';

/**
 * Send OTP to an authorized user
 *
 * @route: /verify/get-otp
 * @method: get
 * @requires: header { authorization: 'Bearer <token>' }
 * @returns: 200 | 400 | 500
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
		logger.error(err.stack);
		// if there was an error, delete the saved otp document
		OTP.deleteOne({ character_id });
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message:
				'Could not send verification code, this could also be due to an invalid email address'
		});
	}
};
