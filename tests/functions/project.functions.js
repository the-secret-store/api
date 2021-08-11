import request from 'supertest';

/**
 * @param {string} authToken
 * @param {{
 * 		project_name: string,
 * 		scope?: 'private' | 'public',
 * 		owner: string,
 * 		secrets?: object
 * }} projectDetails
 */
export const createProject = async (server, authToken, projectDetails) => {
	return await request(server)
		.post('/project/create')
		.set('Authorization', `Bearer ${authToken}`)
		.send(projectDetails);
};

/**
 * @param {string} authToken
 * @param {string} projectIdOrAppId
 * @param {object} secrets
 */
export const postSecrets = (server, authToken, projectIdOrAppId, secrets) => {
	return request(server)
		.post(`/project/${projectIdOrAppId}/post`)
		.set('Authorization', `Bearer ${authToken}`)
		.send({ secrets });
};

/**
 * @param {string} authToken
 * @param {string} projectIdOrAppId
 */
export const fetchSecrets = (server, authToken, projectIdOrAppId) => {
	return request(server)
		.get(`/project/${projectIdOrAppId}/fetch`)
		.set('Authorization', `Bearer ${authToken}`);
};
