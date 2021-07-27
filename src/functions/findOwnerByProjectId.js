import { Project, Team, User } from '@models';
import logger from '@tools/logging';

/**
 * Find and return Project owner document using projectIdOrAppId (_id | app_id)
 * @param {string} projectIdOrAppId
 * @returns {object} Project owner document
 */
export default async function findOwnerByProjectIdOrAppId(projectIdOrAppId) {
	const projectOwnerId = (
		await (projectIdOrAppId.includes('-')
			? Project.findOne({ app_id: projectIdOrAppId }, { owner: 1 })
			: Project.findById(projectIdOrAppId, { owner: 1 }))
	).owner;

	logger.debug('Project owner id: ' + projectOwnerId);
	return (await User.findById(projectOwnerId)) || (await Team.findById(projectOwnerId));
}
