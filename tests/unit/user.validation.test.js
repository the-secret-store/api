import { validatePasswordChange, validateUser } from '@validation';
import { validObjectId, validUserObject1, validUserObject2 } from '../constants';

describe('User validations', () => {
	describe('Create user', () => {
		it('error should be undefined for valid user object', () => {
			const { error } = validateUser(validUserObject1);
			expect(error).toBeUndefined();
		});

		it('should throw error if one of the mandatory fields is not present', () => {
			const invalidUserObject1 = { ...validUserObject1 };
			delete invalidUserObject1.display_name;

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});

		it('should throw error for invalid name', () => {
			const invalidUserObject1 = { ...validUserObject1 };
			invalidUserObject1.display_name = 'a';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});

		const invalidUserObject1 = { ...validUserObject1 };

		// password strength is tested bu unit tests
		it('should throw error for weak passwords', () => {
			invalidUserObject1.password = 'a';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});

		it('should throw error for invalid email', () => {
			const invalidUserObject1 = { ...validUserObject1 };
			invalidUserObject1.email = 'an invalid email';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});
	});

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
});
