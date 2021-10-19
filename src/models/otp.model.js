import { Schema, model } from 'mongoose';

const OTPSchema = new Schema(
	{
		character_id: { type: Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
		otp: { type: Number, min: 100000, max: 999999, required: true }
	},
	{ timestamps: true }
);

// Expires in 1 hour
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 });
export default model('otp', OTPSchema);
