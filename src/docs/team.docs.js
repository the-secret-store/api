import { AuthHeader } from './definitions';

const TeamIdParam = {
	in: 'path',
	name: 'teamId',
	description: 'The team id',
	required: true,
	type: 'string',
	format: 'ObjectId'
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
				201: {
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
				201: {
					description: 'Invite sent successfully'
				},
				400: {
					description: 'Bad request'
				},
				401: {
					description: 'Not authorized'
				},
				403: {
					description: 'Forbidden: not enough privileges'
				},
				409: {
					description: 'User was already invited'
				}
			}
		}
	},
	'team/{teamId}/delete': {
		delete: {
			summary: 'Delete a team',
			description: 'Delete an existing team',
			tags: ['team'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [AuthHeader, TeamIdParam],
			responses: {
				200: {
					description: 'Team deleted successfully'
				},
				401: {
					description: 'Not authorized to perform this operation'
				},
				403: {
					description: 'Forbidden: not enough privileges'
				},
				404: {
					description: 'Team not found'
				},
				500: {
					description: 'Internal server error'
				}
			}
		}
	}
};
