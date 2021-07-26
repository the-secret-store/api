import Joi from 'joi';

/**
 * Validate projectId and secrets object types in post request
 * @param {string} app_id
 * @param {object} secrets
 * @returns Joi validator
 */
export default function validateProjectPostRequest(projectId, secrets) {
	const schema = Joi.object({
		projectId: Joi.string().required(),
		secrets: Joi.object().required()
	});

	return schema.validate({ projectId, secrets });
}
