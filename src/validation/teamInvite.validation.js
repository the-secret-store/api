import Joi from 'joi';
import { JoiObjectId } from './schemas';
import { User } from '@models';
import { logger } from '@tools';
import { prettyJson } from '@utilities';

/**
 *  Validates team invite request
 * @param {{user_email: string, teamId: string}} invitationConfig
 * @returns
 */
export default async function validateTeamInvite({ teamId, user_email }) {
	let { error } = Joi.object({
		teamId: JoiObjectId().required(),
		user_email: Joi.string()
			.email({ tlds: { allow: false } })
			.required()
	}).validate({ teamId, user_email });

	if (error) {
		logger.debug(prettyJson(error));
		return { error };
	}

	const invitedUser = await User.findOne({ email: user_email });
	if (!invitedUser) {
		return {
			error: {
				details: [
					{
						message: `${user_email} is not found in the user records`,
						extendedMessage: 'Request the user to create an account'
					}
				]
			}
		};
	}

	return { invitedUser };
}
