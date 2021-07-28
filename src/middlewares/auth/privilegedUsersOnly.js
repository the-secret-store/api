import { StatusCodes } from 'http-status-codes';
import { findOwnerByProjectIdOrAppId } from '@functions';

/**
 * A middleware that forbids unprivileged users (those that don't have access to the project)
 * from accessing secure routes (e.g. /project/:projectIdOrAppId/post, /project/:projectIdOrAppId/fetch)
 *
 * + new: also mounts project and owner objects to the request object
 * @pre-requisite: authorize and verifiedAccountsOnly middlewares
 */
export default async (req, res, next) => {
	//* use authorization and verifiedAccountsOnly middlewares
	const { projectIdOrAppId } = req.params;
	const { user } = req;

	const { project, owner } = await findOwnerByProjectIdOrAppId(projectIdOrAppId);
	if (!owner) {
		res.status(StatusCodes.BAD_GATEWAY).json({ message: 'Project owner could not be found' });
	}

	if (!(owner.id === user.id || owner.members?.includes(user.id))) {
		return res.status(StatusCodes.FORBIDDEN).json({
			message: 'Access denied',
			details:
				'You are not privileged to make changes to the project. You are neither the owner, nor a member of the team that owns this project'
		});
	}

	req.project = project;
	req.owner = owner;
	next();
};
