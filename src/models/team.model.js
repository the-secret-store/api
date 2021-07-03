import { model, Schema, Types } from 'mongoose';

const TeamSchema = new Schema(
	{
		teamName: { type: Types.String, required: true, trim: true },
		members: { type: [{ type: Types.ObjectId, ref: 'user' }] },
		projects: { type: [{ type: Types.ObjectId, ref: 'project' }] }
	},
	{ timestamps: true }
);

export default model('team', TeamSchema);
