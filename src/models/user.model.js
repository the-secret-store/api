import Joi from 'joi';
import { model, Schema, Types } from 'mongoose';

const UserSchema = new Schema(
	{
		display_name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true },
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
 * @param {*} userObject
 * @returns Joi validator
 */

export const validateUser = userObject => {
	const schema = Joi.object({
		display_name: Joi.string().required(),
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required(),
		password: Joi.string().required()
	});

	return schema.validate(userObject);
};
