import { AuthHeader } from './definitions';

export default {
	'/invitation/{invitationId}/accept': {
		put: {
			summary: 'Accept an invite',
			description: 'Accept a team invitation and join the team',
			tags: ['invitation'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				{
					in: 'path',
					name: 'invitationId',
					description: 'The invitation id',
					type: 'string',
					required: true,
					format: 'ObjectId'
				}
			],
			responses: {
				200: {
					description: 'Invitation accepted successfully'
				},
				400: {
					description: 'Invalid request parameters'
				},
				401: {
					description: 'Not authorized'
				},
				403: {
					description: 'User not verified'
				},
				404: {
					description: 'Invitation not found'
				}
			}
		}
	}
};
