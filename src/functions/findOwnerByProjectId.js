import { Project, Team, User } from '@models';
import logger from '@tools/logging';

/**
 * Find and return Project owner document using projectId (_id)
 * @param {string} projectId
 * @returns {object} Project owner document
 */
export default async function findOwnerByProjectId(projectId) {
	const projectOwnerId = (await Project.findById(projectId)).owner;
	logger.debug('Project owner id: ' + projectOwnerId);
	return (await User.findById(projectOwnerId)) || (await Team.findById(projectOwnerId));
}
