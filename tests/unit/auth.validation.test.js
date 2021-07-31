import { validateAuthRequest } from '@validation';
import { validUserObject1 } from '../constants/user.constant';

describe('Joi validations - auth', () => {
	it('should throw error for invalid email', () => {
		const { error } = validateAuthRequest({
			email: 'invalid',
			password: validUserObject1.password
		});
		expect(error).toBeDefined();
	});

	it('should throw error for weak passwords', () => {
		const { error } = validateAuthRequest({ email: validUserObject1.email, password: 'abcd123' });
		expect(error).toBeDefined();
	});

	it('should throw error if any of the fields is not defined', () => {
		const { error } = validateAuthRequest({
			password: validUserObject1.password
		});
		expect(error).toBeDefined();
		const { error: mpError } = validateAuthRequest({
			email: validUserObject1.email
		});
		expect(mpError).toBeDefined();
	});
});
