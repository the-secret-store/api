import Joi from 'joi';
import { model, Schema, Types } from 'mongoose';
import { JoiComplexPassword } from '@validation';

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
		password: JoiComplexPassword().required()
	});

	return schema.validate(userObject);
};
