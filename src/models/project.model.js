import Joi from 'joi';
import { model, Schema } from 'mongoose';
import { generateRandomName } from '@utilities';

const ProjectSchema = new Schema(
	{
		project_name: { type: String, required: true, trim: true },
		app_id: { type: String, default: generateRandomName, unique: true },
		scope: { type: String, enum: ['user', 'team', 'public'], required: true },
		secrets: { type: Schema.Types.Mixed, default: {} },
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
		project_name: Joi.string().required(),
		owner: Joi.string().required(),
		scope: Joi.string().required()
	});

	return schema.validate(projectObject);
};
