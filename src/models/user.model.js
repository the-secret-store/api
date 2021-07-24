import Joi from 'joi';
import PasswordComplexity from 'joi-password-complexity';
import { model, Schema, Types } from 'mongoose';

const UserSchema = new Schema(
	{
		display_name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true },
		password: { type: String, required: true },
		teams: { type: [{ type: Types.ObjectId, ref: 'team' }] },
		projects: { type: [{ type: Types.ObjectId, ref: 'project' }] },
		is_verified: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

export default model('user', UserSchema);

/**
 * Validates User object
 *
 * @param {{display_name: string, email: string, password: string}} userObject
 * @returns Joi validator
 */

export const validateUser = userObject => {
	const schema = Joi.object({
		display_name: Joi.string().min(3).required(),
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

	return schema.validate(userObject);
};
