import { generateOTP, generateRandomHex } from '@utilities';

describe('Utilities', () => {
	it('OTP must be 6 digit no.', () => {
		const otp = generateOTP();
		expect(otp).toBeGreaterThanOrEqual(100000);
		expect(otp).toBeLessThanOrEqual(999999);
	});

	it('Random hex', () => {
		const SIZE = 6;
		const randHex = generateRandomHex(SIZE);
		const hexRegex = new RegExp(/[0-9A-Fa-f]{6}/g);
		expect(randHex.length).toBe(SIZE);
		expect(hexRegex.test(randHex)).toBeTruthy();
	});
});
