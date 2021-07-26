import { StatusCodes } from 'http-status-codes';
import logger from '@tools/logging';
import { validateProjectPostRequest } from '@validation';
import { Project, Team, User, validateProject } from '@models';
import { prettyJson } from '@utilities';

/**
 * Controller for /project/create
 * @param {*} req
 * @param {*} res
 */
export const createProject = async (req, res) => {
	const { project_name, scope, owner, secrets } = req.body;
	const projectAttrs = { project_name, scope, owner, secrets };
	logger.debug('Acknowledged: ' + prettyJson(projectAttrs));

	// 1. validate the request
	const { errors } = validateProject(projectAttrs);
	if (errors) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: errors.details[0].message, details: errors });
	}

	// 2i check if the owner is a valid team/ user
	const projectOwner = (await User.findById(owner)) || (await Team.findById(owner));
	if (!projectOwner) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid owner id' });
	}

	// 2ii. check if the project already exists
	if (await Project.findOne({ project_name, owner })) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Project already exists' });
	}

	// todo: 3. hash, make the secrets string or something
	// (we currently don't allow users to post secrets while creating a project)

	try {
		// 4i. create the project
		const theNewProject = new Project(projectAttrs);
		const {
			_doc: { _id, app_id }
		} = await theNewProject.save();
		logger.debug('Project created successfully');

		// 4ii. add the project to owner's list of projects
		projectOwner.projects.push(_id);
		projectOwner.save();

		// 5. return the created project ids
		return res
			.status(StatusCodes.CREATED)
			.json({ message: 'Project created successfully', data: { id: _id, app_id } });
	} catch (error) {
		// MongoError: Unique key violation
		if (error.code === 11000) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: 'Our random name generator messed up 💩, please try again',
				details: error
			});
		}

		// Other mongo errors
		if (error.name === 'ValidationError') {
			logger.debug(error);
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: error.message, details: error.errors });
		}

		throw error;
	}
};

/**
 * Controller for /project/:projectId/post
 */
export const postSecrets = async (req, res) => {
	const { secrets } = req.body;
	const { projectId } = req.params;

	logger.debug(`Acknowledged secrets of ${projectId}: ${prettyJson(secrets)}`);

	// 1. validate the request
	const { errors } = validateProjectPostRequest(projectId, secrets);

	if (errors) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: errors.details[0].message, details: errors });
	}

	// todo: 2. hash the secrets

	// 3. post the secrets
	try {
		const project = await Project.findById(projectId);
		if (JSON.stringify(project.secrets) === JSON.stringify(secrets)) {
			return res
				.status(StatusCodes.OK)
				.json({ message: 'Already up-to-date', data: { secrets, backup: project.backup } });
		}

		project.backup = project.secrets;
		project.secrets = secrets;
		project.lastUpdatedBy = req.user.id;
		project.save();

		res
			.status(StatusCodes.OK)
			.json({ message: 'Secrets posted successfully', data: { secrets, backup: project.backup } });
	} catch (error) {
		if (error.name === 'ValidationError') {
			// i don't think this would ever occur, but, just to be extra safe
			logger.debug(error);
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: error.message, details: error.errors });
		}

		throw error;
	}
};
