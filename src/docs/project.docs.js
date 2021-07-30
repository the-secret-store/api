import { AuthHeader } from './definitions';

const ProjectOrAppIdParam = {
	in: 'path',
	name: 'projectIdOrAppId',
	description: 'The project id or the app id',
	required: true,
	type: 'string'
};

export default {
	'/project/create': {
		post: {
			summary: 'Create a project',
			description: 'Create a new project',
			tags: ['project'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				{
					in: 'body',
					name: 'New project details',
					description: 'Details required to create a new project',
					required: true,
					schema: {
						// $ref: '#/definitions/NewProject'
						type: 'object',
						required: ['project_name', 'scope', 'owner'],
						properties: {
							project_name: {
								type: 'string',
								description: 'The name of the project',
								required: true
							},
							scope: {
								type: 'string',
								description: 'The scope of the project',
								enum: ['private', 'public'],
								required: true
							},
							owner: {
								type: 'string',
								description: 'The owner_id of the project',
								required: true
							}
						},
						example: {
							project_name: 'My Project',
							scope: 'private',
							owner: '60fe6ba0033a503b50fb695f'
						}
					}
				}
			]
		}
	},
	'/project/{projectIdOrAppId}/fetch': {
		get: {
			summary: "Fetch a project's secrets",
			description: 'Fetch all the secrets of a project',
			tags: ['project'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [AuthHeader, ProjectOrAppIdParam],
			responses: {
				200: {
					description: 'The project secrets were fetched successfully'
				},
				400: {
					description: 'Request error'
				},
				403: {
					description: 'Forbidden: not enough privileges to fetch the secrets'
				},
				404: {
					description: 'Not found: the project was not found'
				},
				500: {
					description: 'Internal Server Error'
				}
			}
		}
	},
	'/project/{projectIdOrAppId}/post': {
		post: {
			summary: 'Post a secret to a project',
			description: 'Update the secrets of a project',
			tags: ['project'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				ProjectOrAppIdParam,
				{
					in: 'body',
					name: 'Post secrets body',
					description: 'The secrets to post',
					required: true,
					schema: {
						// $ref: '#/definitions/PostSecrets'
						type: 'object',
						required: ['secrets'],
						properties: {
							secrets: {
								type: 'object',
								description: 'The secrets to post/ update',
								required: true
							}
						},
						example: {
							secrets: {
								key1: 'value1',
								key2: 'value2'
							}
						}
					}
				}
			],
			responses: {
				200: {
					description: 'The secrets were posted successfully'
				},
				400: {
					description: 'Request error'
				},
				403: {
					description: 'Forbidden: not enough privileges to post the secrets'
				},
				404: {
					description: 'Not found: the project was not found'
				},
				500: {
					description: 'Internal Server Error'
				}
			}
		}
	}
};
