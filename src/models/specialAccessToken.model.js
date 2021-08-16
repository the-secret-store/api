import Joi from 'joi';
import { Schema, model } from 'mongoose';

import { JoiObjectId } from '@validation/schemas';

const SATSchema = new Schema(
	{
		name: { type: String, required: true },
		created_by: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
		to: { type: String, required: true },
		valid_until: { type: Date }
	},
	{ timestamps: true }
);

export const validateSAT = satDto => {
	const schema = Joi.object({
		name: Joi.string().min(3).max(15).required(),
		projectId: JoiObjectId().required()
	});

	return schema.validate(satDto);
};

export default model('specialAccessToken', SATSchema);
