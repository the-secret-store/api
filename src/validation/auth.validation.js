import Joi from 'joi';
import PasswordComplexity from 'joi-password-complexity';

/**
 * Validates login credentials
 * @param {{email: string, password: string}} requestBody
 * @returns Joi validator
 */
export default function validateAuthRequest(requestBody) {
	const schema = Joi.object({
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required(),
		password: new PasswordComplexity({
			min: 6,
			max: 18,
			lowerCase: 1,
			upperCase: 1,
			numeric: 1,
			symbol: 1,
			requirementCount: 4
		}).required()
	});

	return schema.validate(requestBody);
}
