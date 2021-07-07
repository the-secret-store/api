import Joi from 'joi';
import { model, Schema, Types } from 'mongoose';

const UserSchema = new Schema(
	{
		displayName: { type: String, required: true, trim: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		teams: { type: [{ type: Types.ObjectId, ref: 'team' }] },
		projects: { type: [{ type: Types.ObjectId, ref: 'project' }] }
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
		displayName: Joi.string().required(),
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required(),
		password: Joi.string().required()
	});

	return schema.validate(userObject);
};
