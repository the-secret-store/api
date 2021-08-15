import config from 'config';
import { StatusCodes } from 'http-status-codes';
import { Invitation, Team, User, validateTeam } from '@models';
import { logger } from '@tools';
import { prettyJson, sendMail } from '@utilities';
import { validateTeamInvite } from '@validation';

/**
 * Controller for teams
 *
 * Available controllers: createTeam, inviteUser
 */

/**
 * Controller to create a team
 * @requires {authorization} : header, {team_name}: body
 */

export const createTeam = async (req, res) => {
	// * use authorization, verifiedUsersOnly middlewares
	const { team_name } = req.body;
	const { id: owner } = req.user;

	logger.silly(`Controller(team, create) | Ack: ${prettyJson({ team_name, owner })}`);

	// 1. validate the request
	const { error } = validateTeam({ team_name, owner });
	if (error) {
		logger.debug(prettyJson(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error });
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

	// 2p. check if the user has reached max no. of teams limit
	const noOfTeams = (await User.findById(owner, { teams: 1 })).teams.length;
	if (noOfTeams >= config.get('maxTeams')) {
		return res.status(StatusCodes.FORBIDDEN).json({
			message: 'Number of teams limit reached',
			extendedMessage: `You have already created/ joined ${noOfTeams} teams, which the upper limit. Remove/ leave unwanted/ old teams to create more.`
		});
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

/**
 * Controller to invite an existing user to a team
 *
 * @requires {authorization}: header, {teamId}: params
 */
export const inviteUser = async (req, res) => {
	// * use authorization, verifiedUsersOnly and teamAdminsOnly middlewares
	const { display_name, id: invitingUserId } = req.user;
	const { teamId } = req.params;
	const { user_email } = req.body;
	const { team_name, members, admins } = req.team; //mounted by middleware

	logger.silly(
		`Controller(team, invite) | Ack: ${prettyJson({
			user_email,
			teamId,
			display_name,
			invitingUserId
		})}`
	);

	// 1. validate the invite request
	const { invitedUser, error } = await validateTeamInvite({ teamId, user_email });
	if (error) {
		logger.debug(prettyJson(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error.details });
	}

	// 2i. check if the user is already a member
	if (members.includes(invitedUser.id) || admins.includes(invitedUser.id)) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: 'User is already a member of the team' });
	}

	// 2ii. check if the user is already invited
	if (await Invitation.findOne({ invited_to: teamId, invited_user: invitedUser.id })) {
		return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User is already invited' });
	}

	// 3. create the invitation
	const invitation = await new Invitation({
		invited_to: teamId,
		invited_user: invitedUser.id,
		invited_by: invitingUserId
	}).save();

	// 4. send invitation email
	try {
		await sendMail(
			user_email,
			`Invitation to ${team_name} on The Secret Store`,
			`${display_name} has invited to join ${team_name} on The Secret Store, click the link to accept the invitation.
		{{baseUrl}}/invitation/${invitation._doc._id}/accept`
		);

		res
			.status(StatusCodes.OK)
			.json({ message: 'Invitation sent successfully', data: { invitationId: invitation._id } });
	} catch (exp) {
		await Invitation.findByIdAndDelete(invitation._doc._id);
		res
			.status(StatusCodes.FAILED_DEPENDENCY)
			.json({ message: 'Could not send invitation email', details: exp });
		throw exp;
	}
};
