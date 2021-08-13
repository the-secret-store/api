import Joi from 'joi';
import { model, Schema, Types } from 'mongoose';
import { JoiObjectId } from '@validation';

function insertOwner() {
	return [this.owner];
}

const TeamSchema = new Schema(
	{
		team_name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
		owner: { type: Types.ObjectId, ref: 'user' },
		admins: { type: [{ type: Types.ObjectId, ref: 'user' }], default: insertOwner },
		members: { type: [{ type: Types.ObjectId, ref: 'user' }] },
		visibility: { type: String, enum: ['public', 'private'], default: 'private' },
		projects: { type: [{ type: Types.ObjectId, ref: 'project' }] }
	},
	{ timestamps: true }
);

export default model('team', TeamSchema);

/**
 * Validates Team object
 *
 * @param {{team_name: string, owner: string}} teamObject
 * @returns Joi validator
 */

export const validateTeam = teamObject => {
	const schema = Joi.object({
		team_name: Joi.string().min(3).max(50).required(),
		owner: JoiObjectId().required(),
		visibility: Joi.string().valid('private', 'public')
	});

	return schema.validate(teamObject);
};
