import request from 'supertest';

import { loginUser } from './user.functions';

/**
 * @param {string} authToken JWT token
 */
export const getOTP = async (server, authToken) => {
	return await request(server).patch('/verify/get-otp').set('Authorization', `Bearer ${authToken}`);
};

/**
 * @param {string} authToken
 * @param {number} otp
 */
export const verifyUser = async (server, authToken, otp) => {
	return await request(server)
		.put('/verify/check')
		.set('Authorization', `Bearer ${authToken}`)
		.send({ otp });
};

export const fullVerify = async (server, authToken, email, password) => {
	const otpRes = await getOTP(server, authToken);
	const { otp } = otpRes.body;
	await verifyUser(server, authToken, otp);

	const lR = await loginUser(server, { email, password });
	return lR.body.token;
};
