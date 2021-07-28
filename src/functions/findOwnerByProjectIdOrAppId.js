import { Project, Team, User } from '@models';
import logger from '@tools/logging';
import { prettyJson } from '@utilities';

/**
 * Find and return Project owner document using projectIdOrAppId (_id | app_id)
 * @param {string} projectIdOrAppId
 * @returns {object} Project owner document
 */
export default async function findOwnerByProjectIdOrAppId(projectIdOrAppId) {
	const project = await (projectIdOrAppId.includes('-')
		? Project.findOne({ app_id: projectIdOrAppId })
		: Project.findById(projectIdOrAppId));

	logger.debug('Project: ' + prettyJson(project));

	const owner = (await User.findById(project.owner)) || (await Team.findById(project.owner));

	logger.debug(`Owner of id ${project.owner}: ` + prettyJson(owner));

	return { project, owner };
}
