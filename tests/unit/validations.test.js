import { validateUser } from '@models';
import { validUserObject1 } from '../constants/user.constant';

describe('Joi validations', () => {
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

	describe('should throw error for weak passwords', () => {
		const invalidUserObject1 = { ...validUserObject1 };

		it('less than 6 characters', () => {
			invalidUserObject1.password = 'a';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});

		it('no upper case letters', () => {
			invalidUserObject1.password = 'testpass1!';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});

		it('no lower case letters', () => {
			invalidUserObject1.password = 'TESTPASS1!';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});

		it('no numbers', () => {
			invalidUserObject1.password = 'TestPass!';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});

		it('no special characters', () => {
			invalidUserObject1.password = 'TestPass1';

			const { error } = validateUser(invalidUserObject1);
			expect(error).toBeDefined();
		});
	});

	it('should throw error for invalid email', () => {
		const invalidUserObject1 = { ...validUserObject1 };
		invalidUserObject1.email = 'an invalid email';

		const { error } = validateUser(invalidUserObject1);
		expect(error).toBeDefined();
	});
});
