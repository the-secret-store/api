import { model, Schema, Types } from 'mongoose';

const ProjectSchema = new Schema(
	{
		projectName: { type: Types.String, required: true },
		secrets: { type: [Types.String] }, // todo: change to map or something [OR] add a preprocess (obj.stringify)
		owner: { type: Types.ObjectId, required: true } // think a bit..? how to co-work in projects?
	},
	{ timestamps: true }
);

export default model('project', ProjectSchema);
