import Joi from 'joi';
import { model, Schema, Types } from 'mongoose';

function insertOwner() {
	return [this.owner];
}

const TeamSchema = new Schema(
	{
		team_name: { type: String, required: true, trim: true },
		owner: { type: Types.ObjectId, ref: 'user' },
		members: {
			type: [{ type: Types.ObjectId, ref: 'user' }],
			required: true,
			default: insertOwner
		},
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
		team_name: Joi.string().required(),
		owner: Joi.string().required()
	});

	return schema.validate(teamObject);
};
