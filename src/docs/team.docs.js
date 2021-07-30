import { AuthHeader } from './definitions';

const TeamIdParam = {
	in: 'path',
	name: 'teamId',
	description: 'The team id',
	required: true,
	type: 'string',
	format: 'uuid'
};

export default {
	'team/create': {
		post: {
			summary: 'Create a team',
			description: 'Create a new team',
			tags: ['team'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				{
					in: 'body',
					name: 'Team details',
					description: 'Team object to create',
					required: true,
					schema: {
						//$ref: '#/definitions/Team'
						type: 'object',
						required: ['team_name'],
						properties: {
							team_name: {
								type: 'string',
								description: 'The name of the team'
							}
						}
					}
				}
			],
			responses: {
				200: {
					description: 'Team created successfully'
				},
				400: {
					description: 'Bad request / limits reached'
				}
			}
		}
	},
	'team/{teamId}/invite': {
		post: {
			summary: 'Invite a user to a team',
			description: 'Send an invitation to an existing user to a team',
			tags: ['team'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				TeamIdParam,
				{
					in: 'body',
					name: 'Invite details',
					description: 'Invite object to create',
					required: true,
					schema: {
						//$ref: '#/definitions/Invite'
						type: 'object',
						required: ['user_email'],
						properties: {
							user_email: {
								type: 'string',
								description: 'The email of the user to invite'
							}
						},
						example: {
							user_email: 'john@example.com'
						}
					}
				}
			],
			responses: {
				200: {
					description: 'Invite sent successfully'
				},
				400: {
					description: 'Bad request'
				},
				403: {
					description: 'Forbidden: not enough privileges'
				}
			}
		}
	}
};
