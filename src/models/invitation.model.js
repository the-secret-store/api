import { Schema, model } from 'mongoose';
const { Types } = Schema;

const InvitationSchema = new Schema(
	{
		invited_to: { type: Types.ObjectId, required: true, ref: 'team' },
		invited_user: { type: Types.ObjectId, required: true, ref: 'user' },
		invited_by: { type: Types.ObjectId, required: true, ref: 'user' }
	},
	{ timestamps: true }
);

// Expires in 1 week
InvitationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
export default model('invitation', InvitationSchema);
