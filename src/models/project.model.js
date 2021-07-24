import Joi from 'joi';
import { model, Schema } from 'mongoose';
import { generateRandomName } from '@utilities';

const ProjectSchema = new Schema(
	{
		project_name: { type: String, required: true, trim: true },
		app_id: { type: String, default: generateRandomName, unique: true },
		scope: { type: String, enum: ['user', 'team', 'public'], required: true },
		secrets: { type: Schema.Types.Mixed },
		owner: { type: Schema.Types.ObjectId, required: true, refPath: 'ownerModel' },
		ownerModel: { type: String, required: true, enums: ['user', 'team'] }
	},
	{ timestamps: true }
);

export default model('project', ProjectSchema);

/**
 * Validates Project object
 *
 * @param {*} projectObject
 * @returns Joi validator
 */

export const validateProject = projectObject => {
	const schema = Joi.object({
		projectName: Joi.string().required(),
		owner: Joi.required()
	});

	return schema.validate(projectObject);
};
