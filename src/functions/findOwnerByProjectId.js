import { Project, Team, User } from '@models';

/**
 * Find and return Project owner document using projectId (_id)
 * @param {string} projectId
 * @returns {object} Project owner document
 */
export default async function findOwnerByProjectId(projectId) {
	const projectOwnerId = (await Project.findOne({ _id: projectId })).owner;
	return (await User.findById(projectOwnerId)) || Team.findById(projectOwnerId);
}
