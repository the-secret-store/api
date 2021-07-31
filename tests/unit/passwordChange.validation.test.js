import { validatePasswordChange } from '@validation';
import { validObjectId, validUserObject1, validUserObject2 } from '../constants';

const validPasswordChangeReqParams = {
	userId: validObjectId,
	currentPassword: validUserObject1.password,
	newPassword: validUserObject2.password,
	newPasswordConfirmation: validUserObject2.password
};

describe('Password change request validation', () => {
	it('should throw error for invalid userId', () => {
		const { error } = validatePasswordChange({
			...validPasswordChangeReqParams,
			userId: 'funnyId'
		});
		expect(error).toBeDefined();
	});

	it('should throw error for weak passwords', () => {
		const { error } = validatePasswordChange({
			...validPasswordChangeReqParams,
			currentPassword: 'weak-password'
		});
		expect(error).toBeDefined();

		const { error: errForNewPass } = validatePasswordChange({
			...validPasswordChangeReqParams,
			newPassword: 'weak-password'
		});
		expect(errForNewPass).toBeDefined();
	});

	it('should throw error if newPassword & newPasswordConfirmation did not match', () => {
		const { error } = validatePasswordChange({
			...validPasswordChangeReqParams,
			newPasswordConfirmation: validUserObject1.password
		});
		expect(error).toBeDefined();
	});

	it('should accept valid values', () => {
		const { error } = validatePasswordChange(validPasswordChangeReqParams);
		expect(error).toBeUndefined();
	});
});
