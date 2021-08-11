import { StatusCodes } from 'http-status-codes';
import { findOwnerByProjectIdOrAppId } from '@functions';
import { logger } from '@tools/';
import prettyJson from '@utilities/prettyJson';

/**
 * A middleware that forbids (403) unprivileged users (those that don't have access to the project)
 * from accessing secure routes (e.g. /project/:projectIdOrAppId/post, /project/:projectIdOrAppId/fetch)
 *
 * also mounts project and owner objects to the request object
 * @pre-requisite: authorize and verifiedAccountsOnly middlewares
 */
export default async (req, res, next) => {
	//* use authorization and verifiedAccountsOnly middlewares
	const { projectIdOrAppId } = req.params;
	const { user } = req;

	logger.debug('(PrevUsersOnly) Ack : ' + prettyJson(req.params));

	const { project, owner } = await findOwnerByProjectIdOrAppId(projectIdOrAppId);

	if (!project) {
		return res.status(StatusCodes.BAD_GATEWAY).send('Project not found');
	}

	if (!owner) {
		return res
			.status(StatusCodes.BAD_GATEWAY)
			.json({ message: 'Project owner could not be found' });
	}

	if (
		!(owner.id == user.id || owner.members?.includes(user.id) || owner.admins?.includes(user.id))
	) {
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
