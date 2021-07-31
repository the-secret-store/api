import { JoiObjectId, JoiComplexPassword } from '@validation';
import { validObjectId, invalidObjectId } from '../constants';

describe('Joi custom validation schemas', () => {
	describe('ObjectId', () => {
		it('ObjectId: valid', () => {
			const { error } = JoiObjectId().validate(validObjectId);
			expect(error).toBeUndefined();
		});

		it('error for invalid id', () => {
			const { error } = JoiObjectId().validate(invalidObjectId);
			expect(error).toBeDefined();
		});
	});

	describe('Password complexity', () => {
		it('error for missing cap', () => {
			const { error } = JoiComplexPassword().validate('abcdef12,+');
			expect(error).toBeDefined();
		});

		it('error for missing lower', () => {
			const { error } = JoiComplexPassword().validate('ABCDEF12,+');
			expect(error).toBeDefined();
		});

		it('error for missing numbers', () => {
			const { error } = JoiComplexPassword().validate('abcdefGH,+');
			expect(error).toBeDefined();
		});

		it('error for missing spl. chars', () => {
			const { error } = JoiComplexPassword().validate('Abcdef12');
			expect(error).toBeDefined();
		});

		it('error for less than 6 chars', () => {
			const { error } = JoiComplexPassword().validate('Ab1@');
			expect(error).toBeDefined();
		});

		it('valid password', () => {
			const { error } = JoiComplexPassword().validate('Abcdef12@#');
			expect(error).toBeUndefined();
		});
	});
});
