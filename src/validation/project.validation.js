import Joi from 'joi';
import JoiObjectId from './ObjectId.schema';

/**
 * Validate projectId and secrets object types in post request
 * @param {string} app_id
 * @param {object} secrets
 * @returns Joi validator
 */
export default function validateProjectPostRequest(projectIdOrAppId, secrets) {
	const schema = Joi.object({
		projectIdOrAppId: projectIdOrAppId.includes('-')
			? Joi.string().required()
			: JoiObjectId().required(),
		secrets: Joi.object().required()
	});

	return schema.validate({ projectIdOrAppId, secrets });
}
