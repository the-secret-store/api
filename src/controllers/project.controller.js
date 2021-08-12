import { StatusCodes } from 'http-status-codes';
import config from 'config';
import { logger } from '@tools';
import { Project, Team, User } from '@models';
import { prettyJson } from '@utilities';
import { validateProject, validateProjectPostRequest } from '@validation';

/**
 * Controller for /project
 *
 * Available controllers: createProject, postSecrets, fetchSecrets
 */

/**
 * Controller for /project/create
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
		return res.status(StatusCodes.CONFLICT).json({ message: 'Project already exists' });
	}

	// 2p. check if the owner has reached no of projects limit
	const noOfProjects = (await Project.countDocuments({ owner })) || 0;
	if (noOfProjects >= config.get('maxProjects')) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			message: `You have reached the limit of ${noOfProjects} projects`,
			extendedMessage: `You have already created ${noOfProjects} projects, which is the maximum number of projects allowed per user/ team. Remove any old projects to create a new one`
		});
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
 * Controller for /project/:projectIdOrAppId/post
 */
export const postSecrets = async (req, res) => {
	//* use authorization, verifiedUsersOnly and privilegedUsersOnly middlewares
	const { secrets } = req.body;
	const { projectIdOrAppId } = req.params;
	const { project } = req; // the document from db

	logger.debug(`Acknowledged secrets of ${projectIdOrAppId}: ${prettyJson(secrets)}`);

	// 1. validate the request
	const { errors } = validateProjectPostRequest(projectIdOrAppId, secrets);

	if (errors) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: errors.details[0].message, details: errors });
	}

	// todo: 2. hash the secrets

	// 3. post the secrets
	try {
		if (JSON.stringify(project.secrets) == JSON.stringify(secrets)) {
			return res
				.status(StatusCodes.OK)
				.json({ message: 'Already up-to-date', data: { secrets, backup: project.backup } });
		}

		project.backup = project.secrets;
		project.secrets = secrets;
		project.lastUpdatedBy = req.user.id;
		await project.save();

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

/**
 * Controller for /post/:projectIdOrAppId/fetch
 */
export const fetchSecrets = async (req, res) => {
	//* use authorization, verifiedUsersOnly and privilegedUsersOnly middlewares
	const {
		_doc: { app_id, secrets, backup }
	} = req.project;

	// todo: decrypt
	res.status(StatusCodes.OK).json({ message: 'Fetched', data: { app_id, secrets, backup } });
};
