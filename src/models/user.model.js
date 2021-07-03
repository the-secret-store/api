import { model, Schema, Types } from 'mongoose';

const UserSchema = new Schema(
	{
		displayName: { type: Types.String, required: true, trim: true },
		email: { type: Types.String, required: true },
		password: { type: Types.String, required: true },
		teams: { type: [{ type: Types.ObjectId, ref: 'team' }] },
		projects: { type: [{ type: Types.ObjectId, ref: 'project' }] }
	},
	{ timestamps: true }
);

export default model('user', UserSchema);
