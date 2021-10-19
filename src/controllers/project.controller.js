import config from 'config';
import { StatusCodes } from 'http-status-codes';

import { Project, SpecialAccessToken, Team, User } from '@models';
import { logger } from '@tools';
import { prettyJson } from '@utilities';
import { validateProject, validateProjectPostRequest, validateSAT } from '@validation';

/**
 * Controller for /project
 *
 * Available controllers: createProject, postSecrets, fetchSecrets, addSpecialAccessToken
 */

/**
 * Controller for /project/create
 */
export const createProject = async (req, res) => {
	const { project_name, scope, owner, secrets } = req.body;
	const projectAttrs = { project_name, scope, owner, secrets };
	logger.silly('Controller(project, create) | Ack: ' + prettyJson(projectAttrs));

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
			logger.debug(prettyJson(error));
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

	logger.silly(
		`Controller(project, postSecrets) | Ack: ${prettyJson({ projectIdOrAppId, secrets })}`
	);

	// 1. validate the request
	const { error } = validateProjectPostRequest(projectIdOrAppId, secrets);

	if (error) {
		logger.debug(prettyJson(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error });
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
			logger.debug(prettyJson(error));
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
	//* use SAT, authorization, verifiedUsersOnly and privilegedUsersOnly middlewares
	const {
		_doc: { app_id, secrets, backup }
	} = req.project;

	logger.silly(
		`Controller(project, fetchSecrets) | Data: ${prettyJson({
			req: { user: req.user, project: req.params.projectIdOrAppId },
			res: { app_id, secrets, backup }
		})}`
	);

	// todo: decrypt
	res.status(StatusCodes.OK).json({ message: 'Fetched', data: { app_id, secrets, backup } });
};

/**
 * Controller for /post/:projectIdOrAppId/addSAT
 */
export const addSpecialAccessToken = async (req, res) => {
	//* use authorization, verifiedUsersOnly and privilegedUsersOnly middlewares
	const { project, user } = req; // the document from db
	const { name } = req.body;

	logger.silly(
		`Controller(project, addSat) | Ack: ${prettyJson({
			toProject: project,
			userPerformingOp: user
		})}`
	);

	// 1. validate
	const { error } = validateSAT({ name, projectId: project.id });
	if (error) {
		logger.debug(prettyJson(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error.details });
	}

	// create the token
	const {
		_doc: { _id: satId }
	} = await new SpecialAccessToken({
		created_by: user.id,
		to: project.id,
		name
	}).save();

	// push it to list of tokens
	project.special_access_tokens.push(satId);
	await project.save();

	res.status(StatusCodes.CREATED).json({
		message: 'Special Access Token created successfully',
		data: { name, token: satId, projectId: project.id }
	});
};
