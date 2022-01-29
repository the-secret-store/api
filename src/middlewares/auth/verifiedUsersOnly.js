import { StatusCodes } from 'http-status-codes';

import { logger } from '@tools';

/**
 * A middleware that forbids (403) unverified accounts from accessing secure routes
 * @pre-requisite: authorize middleware
 */
export default (req, res, next) => {
	//* use authorization middleware
	const { unverified } = req.user;

	logger.silly(`Middleware(verifiedOnly) | Status: ${unverified ? 'un' : ''}verified`);

	if (unverified) {
		return res.status(StatusCodes.FORBIDDEN).json({
			message: 'Your account needs to be verified to perform this action',
			extendedMessage:
				'If you have verified your account and yet seeing this message, please try logging out and logging in again.'
		});
	}
	next();
};
