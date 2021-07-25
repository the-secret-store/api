import Joi from 'joi';

/**
 * Validate projectId and secrets object types in post request
 * @param {string} app_id
 * @param {object} secrets
 * @returns Joi validator
 */
export default function validateProjectPostRequest(app_id, secrets) {
	const schema = Joi.object({
		app_id: Joi.string().required(),
		secrets: Joi.object().required()
	});

	return schema.validate({ app_id, secrets });
}
