import { StatusCodes } from 'http-status-codes';
import { Team, User, validateTeam } from '@models';
import logger from '@tools/logging';
import prettyJson from '@utilities/prettyJson';

/**
 * Controller for teams
 *
 * Available controllers: createTeam, inviteUser
 */

export const createTeam = async (req, res) => {
	// * use authorization, verifiedUsersOnly middlewares
	const { team_name } = req.body;
	const { id: owner } = req.user;

	logger.debug(`Acknowledged: ${prettyJson({ team_name, owner })}`);

	// 1. validate the request
	const { errors } = validateTeam({ team_name, owner });
	if (errors) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: errors.details[0].message, details: errors });
	}

	// 2. check if the team already exists under the same owner
	const existingTeam = await Team.findOne({ team_name, owner });
	if (existingTeam) {
		const {
			// eslint-disable-next-line no-unused-vars
			_doc: { __v, ...team }
		} = existingTeam;
		return res
			.status(StatusCodes.CONFLICT)
			.json({ message: 'Team already exists', data: { ...team } });
	}

	// 3. create the team
	const {
		// eslint-disable-next-line no-unused-vars
		_doc: { __v, ...team }
	} = await new Team({ team_name, owner }).save();

	// 4. push the team to owner's team list
	await User.findByIdAndUpdate(owner, { $push: { teams: team._id } });

	return res.status(StatusCodes.CREATED).json({ message: 'Team created', data: { ...team } });
};
