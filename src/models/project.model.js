import Joi from 'joi';
import { model, Schema, Types } from 'mongoose';

const ProjectSchema = new Schema(
	{
		projectName: { type: String, required: true },
		secrets: { type: String }, // todo: change to map or something [OR] add a preprocess (obj.stringify)
		owner: { type: Types.ObjectId, required: true } // think a bit..? how to co-work in projects?
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
