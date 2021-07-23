import { StatusCodes } from 'http-status-codes';

/**
 * A middleware that forbids unverified accounts from accessing secure routes
 * @pre-requisite: authorize middleware
 */
export default (req, res, next) => {
	//* use authorization middleware
	const { unverified } = req.user;
	if (unverified) {
		return res
			.status(StatusCodes.FORBIDDEN)
			.json({ message: 'Your account needs to be verified to perform this action' });
	}
	next();
};
