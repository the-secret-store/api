import { StatusCodes } from 'http-status-codes';
import { findOwnerByProjectId } from '@functions';
import logger from '@tools/logging';
import prettyJson from '@utilities/prettyJson';

/**
 * A middleware that forbids unprivileged users (those that don't have access to the project)
 * from accessing secure routes (e.g. /project/:projectId/post, /project/:projectId/fetch)
 * @pre-requisite: authorize and verifiedAccountsOnly middlewares
 */
export default async (req, res, next) => {
	//* use authorization and verifiedAccountsOnly middlewares
	const { projectId } = req.params;
	const { user } = req;

	const owner = await findOwnerByProjectId(projectId);
	if (!owner) {
		res.status(StatusCodes.BAD_GATEWAY).json({ message: 'Project owner could not be found' });
	}
	logger.debug('Project owner: ' + prettyJson(owner));

	if (!(owner.id === user.id || owner.members?.includes(user.id))) {
		return res.status(StatusCodes.FORBIDDEN).json({
			message: 'Access denied',
			details:
				'You are not privileged to make changes to the project. You are neither the owner, nor a member of the team that owns this project'
		});
	}
	next();
};
