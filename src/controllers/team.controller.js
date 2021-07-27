import { StatusCodes } from 'http-status-codes';
import { Invitation, Team, User, validateTeam } from '@models';
import logger from '@tools/logging';
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

/**
 * Controller to invite an existing user to a team
 *
 * @requires {authorization}: header, {teamId}: params
 */
export const inviteUser = async (req, res) => {
	const { display_name, id: invitingUserId } = req.user;
	const { teamId } = req.params;
	const { user_email } = req.body;
	const { team_name, members, admins } = req.team; //mounted by middleware

	// 1. validate the invite request
	const { invitedUser, error } = await validateTeamInvite({ user_email });
	if (error) {
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

		res.status(StatusCodes.OK).json({ message: 'Invitation sent successfully' });
	} catch (exp) {
		await Invitation.findByIdAndDelete(invitation._doc._id);
		res
			.status(StatusCodes.FAILED_DEPENDENCY)
			.json({ message: 'Could not send invitation email', details: exp });
		throw exp;
	}
};
