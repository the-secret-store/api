import Joi from 'joi';

import { JoiComplexPassword } from './schemas';

/**
 * Validates login credentials
 * @param {{email: string, password: string}} requestBody
 * @returns Joi validator
 */
export default function validateAuthRequest(requestBody) {
	const schema = Joi.object({
		email: Joi.string()
			.min(6)
			.max(100)
			.email({ tlds: { allow: false } })
			.required(),
		password: JoiComplexPassword().required()
	});

	return schema.validate(requestBody);
}
