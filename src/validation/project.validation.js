import Joi from 'joi';

import { JoiObjectId } from './schemas';

/**
 * Validate projectId and secrets object types in post request
 * @param {string} app_id
 * @param {object} secrets
 * @returns Joi validator
 */
export default function validateProjectPostRequest(projectIdOrAppId, secrets) {
	const schema = Joi.object({
		projectIdOrAppId: projectIdOrAppId?.toString().includes('-')
			? Joi.string().min(12).required() // has hex string of length 6, 2 '-'s
			: JoiObjectId().required(),
		secrets: Joi.object().required()
	});

	return schema.validate({ projectIdOrAppId, secrets });
}
