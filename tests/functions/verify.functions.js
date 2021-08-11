import request from 'supertest';

/**
 * @param {string} authToken JWT token
 */
export const getOTP = async (server, authToken) => {
	return await request(server).get('/verify/get-otp').set('Authorization', `Bearer ${authToken}`);
};

/**
 * @param {string} authToken
 * @param {number} otp
 */
export const verifyUser = async (server, authToken, otp) => {
	return await request(server)
		.post('/verify/check')
		.set('Authorization', `Bearer ${authToken}`)
		.send({ otp });
};
