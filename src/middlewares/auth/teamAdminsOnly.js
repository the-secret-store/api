import { StatusCodes } from 'http-status-codes';

import { Team } from '@models';
import { logger } from '@tools';

/**
 * A middleware that forbids non-admin users of a team
 * from accessing secure routes (e.g. /team/:teamId/invite, /team/:teamId/remove)
 * @pre-requisite: authorize and verifiedAccountsOnly middlewares
 */
export default async (req, res, next) => {
	//* use authorization and verifiedAccountsOnly middlewares
	const { teamId } = req.params;
	const { user } = req;

	logger.silly('Middleware(teamAdminsOnly)');

	const team = await Team.findById(teamId);
	if (!team) {
		return res.status(StatusCodes.NOT_FOUND).json({ message: 'Team not found' });
	}

	if (!team.admins.includes(user.id)) {
		return res.status(StatusCodes.FORBIDDEN).json({
			message: 'Insufficient privileges',
			details:
				'You need to be an administrator to perform this operation. You are not an administrator'
		});
	}

	req.team = team;
	next();
};
