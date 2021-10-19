import Joi from 'joi';

import { JoiComplexPassword, JoiObjectId } from './schemas';

/**
 * Validates a password change request
 *
 * @param {{userId: string,
 *  				currentPassword: string,
 * 					newPassword: string,
 * 					newPasswordConfirmation: string}} passwordChangeReqParams
 * @returns Joi validator
 */
export default function validatePasswordChange(passwordChangeReqParams) {
	const schema = Joi.object({
		userId: JoiObjectId().required(),
		currentPassword: JoiComplexPassword().required(),
		newPassword: JoiComplexPassword().required(),
		newPasswordConfirmation: Joi.any()
			.equal(Joi.ref('newPassword'))
			.required()
			.messages({ 'any.only': '{{#label}} does not match' })
	});

	return schema.validate(passwordChangeReqParams);
}
