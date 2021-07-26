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

export const postSecrets = async (req, res) => {
	const { app_id, secrets } = req.body;
	const { id } = req.user;

	// 1. validate the request
	const { errors } = validateProjectPostRequest(app_id, secrets);

	if (errors) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: errors.details[0].message, details: errors });
	}

	// 2. post the secrets
};
