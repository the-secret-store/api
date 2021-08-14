import { Schema, model } from 'mongoose';

const SATSchema = new Schema(
	{
		created_by: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
		to: { type: String, required: true },
		valid_until: { type: Date }
	},
	{ timestamps: true }
);

export default model('specialAccessToken', SATSchema);
