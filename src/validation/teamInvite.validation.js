import Joi from 'joi';
import { User } from '@models';
import logger from '@tools/logging';
import { prettyJson } from '@utilities';

/**
 *  Validates team invite request
 * @param {{user_email: string}} invitationConfig
 * @returns
 */
export default async function validateTeamInvite({ user_email }) {
	// is already a valid team id, since teamAdminsOnly middleware does not allow invalid team ids

	let { error } = Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.validate(user_email);

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
						message: `${user_email} is not found the user records`,
						extendedMessage: 'Request the user to create an account'
					}
				]
			}
		};
	}

	return { invitedUser };
}
