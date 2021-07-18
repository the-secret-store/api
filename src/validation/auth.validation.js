import Joi from 'joi';
import PasswordComplexity from 'joi-password-complexity';

export default function validateAuthRequest(requestBody) {
	const schema = Joi.object({
		email: Joi.email({ tlds: { allow: false } }).required(),
		password: new PasswordComplexity({
			min: 6,
			max: 18,
			lowerCase: 1,
			upperCase: 1,
			numeric: 1,
			symbol: 1,
			requirementCount: 4
		})
	});

	return schema.validate(requestBody);
}
