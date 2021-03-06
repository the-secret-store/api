import { StatusCodes } from 'http-status-codes';

import { Invitation, Team } from '@models';
import { logger } from '@tools';
import { prettyJson } from '@utilities';
import { JoiObjectId } from '@validation';

/**
 * Controllers for /invitation routes
 *
 * Available controllers: acceptInvitation
 */

export const acceptInvitation = async (req, res) => {
	// uses authorize and verifiedUsers only middlewares
	const { invitationId } = req.params;
	const { id: userId } = req.user;

	logger.silly(`Controller(invitation, accept) | Ack: ${prettyJson({ invitationId, userId })}`);

	// 1. validate the invitation
	const { error } = JoiObjectId().required().validate(invitationId);
	if (error) {
		logger.debug(prettyJson(error));
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error.details });
	}

	// 2. find the invitation and check if the user is invited
	const invitation = await Invitation.findById(invitationId);
	logger.silly(`Invitation ${invitationId} found: ${prettyJson(invitation)}`);

	if (!invitation || invitation?.invited_user != userId) {
		return res.status(StatusCodes.NOT_FOUND).json({
			message: 'Invitation not found',
			extendedMessage: 'Either the invitation was not found, expired or the user is not invited'
		});
	}

	// 3. add the user to members array
	const team = await Team.findById(invitation.invited_to);
	if (!team) {
		return res.status(StatusCodes.NOT_FOUND).json({ message: 'The team no longer exists' });
	}

	team.members.push(userId);
	await team.save();

	// 4. remove the invitation
	await Invitation.findByIdAndDelete(invitationId);

	res
		.status(StatusCodes.OK)
		.json({ message: 'Invitation accepted', data: { teamId: invitation.invited_to } });
};
