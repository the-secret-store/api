import Joi from 'joi';

/**
 * Joi validation schema for an ObjectId
 */
export default function JoiObjectId() {
	return Joi.string()
		.required()
		.pattern(new RegExp(/^[0-9a-fA-F]{24}$/), { name: 'ObjectId' })
		.messages({
			'string.pattern.base': 'Invalid ObjectId'
		});
}
