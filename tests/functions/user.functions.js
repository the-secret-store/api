import request from 'supertest';

/**
 * @param {{
 * 		display_name: string,
 * 		email: string,
 * 		password: string
 * }} userObject
 */
export const registerUser = async (server, userObject) => {
	return await request(server).post('/user/register').send(userObject);
};

/**
 * @param {{
 * currentPassword: string,
 * newPassword: string,
 * newPasswordConfirmation: string
 * }} passwordChangeReqParams
 */
export const changePassword = (server, passwordChangeReqParams, authToken) => {
	return request(server)
		.post('/user/changePassword')
		.send(passwordChangeReqParams)
		.set('Authorization', 'Bearer ' + authToken);
};

/**
 * @param {{email: string, password: string}} credentials
 */
export const loginUser = async (server, credentials) => {
	return await request(server).post('/auth/login').send(credentials);
};
