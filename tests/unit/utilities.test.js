import { generateOTP } from '@utilities';

describe('Utilities', () => {
	it('OTP must be 6 digit no.', () => {
		const otp = generateOTP();
		expect(otp).toBeGreaterThanOrEqual(100000);
		expect(otp).toBeLessThanOrEqual(999999);
	});
});
