import request from 'supertest';

/**
 * @param {string} authToken
 * @param {{
 * 		team_name: string,
 *    ownerId: string,
 *    isPublic?: boolean
 * }} teamDetails
 */
export const createTeam = async (server, authToken, teamDetails) => {
	return request(server)
		.post('/team/create')
		.set('Authorization', `Bearer ${authToken}`)
		.send(teamDetails);
};

/**
 * @param {string} authToken
 * @param {string} teamId
 * @param {string} invitedUser
 */
export const inviteToTeam = async (server, authToken, teamId, invitedUser) => {
	return request(server)
		.post(`/team/${teamId}/invite`)
		.set('Authorization', `Bearer ${authToken}`)
		.send({ user_email: invitedUser });
};

/**
 * @param {string} authToken
 * @param {string} invitationId
 */
export const acceptInvitation = async (server, authToken, invitationId) => {
	return request(server)
		.put(`/invitation/${invitationId}/accept`)
		.set('Authorization', `Bearer ${authToken}`);
};
