import Joi from 'joi';
import { model, Schema } from 'mongoose';
import { generateRandomName } from '@utilities';
import { JoiObjectId } from '@validation';

const ProjectSchema = new Schema(
	{
		project_name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
		app_id: { type: String, default: generateRandomName, unique: true },
		scope: { type: String, enum: ['private', 'public'], required: true },
		backup: { type: Schema.Types.Mixed, default: {} },
		secrets: { type: Schema.Types.Mixed, default: {} },
		lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'user' },
		owner: { type: Schema.Types.ObjectId, required: true, refPath: 'ownerModel' },
		ownerModel: { type: String, enums: ['user', 'team'] }
	},
	{ timestamps: true }
);

export default model('project', ProjectSchema);

/**
 * Validates Project object
 *
 * @param {{project_name: string, owner: string, scope: string}} projectObject
 * @returns Joi validator
 */

export const validateProject = projectObject => {
	const schema = Joi.object({
		project_name: Joi.string().min(3).max(50).required(),
		owner: JoiObjectId().required(),
		scope: Joi.string().required().valid('private', 'public')
	});

	return schema.validate(projectObject);
};
