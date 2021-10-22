import { AuthHeader } from './definitions';

const ProjectOrAppIdParam = {
	in: 'path',
	name: 'projectIdOrAppId',
	description: 'The project id or the app id',
	required: true,
	type: 'string',
	format: 'ObjectId'
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
			],
			responses: {
				201: {
					description: 'Project created successfully',
					schema: {
						type: 'object',
						properties: {
							data: {
								type: 'object',
								properties: {
									id: { type: 'string', format: 'ObjectId' },
									app_id: { type: 'string' }
								}
							}
						},
						example: {
							data: {
								id: '5c8f8f8f8f8f8f8f8f8f8f8',
								app_id: 'confused-raman-6f7d3a'
							}
						}
					}
				},
				400: {
					description: 'Request error'
				},
				401: {
					description: 'Not authorized to perform this action'
				},
				403: {
					description: 'Forbidden: not enough privileges to fetch the secrets'
				},
				409: {
					description: 'Project already exists'
				},
				500: {
					description: 'Internal Server Error'
				}
			}
		}
	},
	'/project/{projectIdOrAppId}/fetch': {
		get: {
			summary: "Fetch a project's secrets",
			description: 'Fetch all the secrets of a project',
			tags: ['project'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				ProjectOrAppIdParam,
				{
					in: 'header',
					name: 'special-access-token',
					description: 'Special access token',
					required: false,
					type: 'string',
					format: 'ObjectId'
				}
			],
			responses: {
				200: {
					description: 'The project secrets were fetched successfully'
				},
				400: {
					description: 'Request error'
				},
				401: {
					description: 'Not authorized to perform this action'
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
		put: {
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
	},
	'/project/{projectIdOrAppId}/addSat': {
		patch: {
			summary: 'Create a special access token',
			description: 'Add a special access token to the project',
			tags: ['project'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				ProjectOrAppIdParam,
				{
					in: 'body',
					name: 'Add SAT body',
					required: true,
					schema: {
						// $ref: '#/definitions/PostSecrets'
						type: 'object',
						required: ['name'],
						properties: {
							name: {
								type: 'string',
								description: 'Name of the SAT'
							}
						},
						example: {
							name: 'GitHub Actions'
						}
					}
				}
			],
			responses: {
				201: {
					description: 'The Special Access Token was created successfully'
				},
				400: {
					description: 'Request error'
				},
				403: {
					description: 'Forbidden: not enough privileges to perform the operation'
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
	'/project/{projectIdOrAppId}/removeSat/{sat}': {
		delete: {
			summary: 'Remove a special access token',
			description: 'Remove a special access token from the project',
			tags: ['project'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				ProjectOrAppIdParam,
				{
					in: 'path',
					name: 'Special Access Token',
					description: 'The SAT to be removed',
					required: true,
					type: 'string',
					format: 'ObjectId'
				}
			],
			responses: {
				200: {
					description: 'The SAT was removed successfully'
				},
				400: {
					description: 'Request error'
				},

				401: {
					description: 'Unauthorized: the user is not authenticated'
				},
				403: {
					description: 'Forbidden: not enough privileges to perform the operation'
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
	'/project/{projectIdOrAppId}/delete': {
		delete: {
			summary: 'Delete a project',
			description: 'Delete a project',
			tags: ['project'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [AuthHeader, ProjectOrAppIdParam],
			responses: {
				200: {
					description: 'The project was deleted successfully'
				},
				400: {
					description: 'Request error'
				},
				401: {
					description: 'Unauthorized: the user is not authenticated'
				},
				403: {
					description: 'Forbidden: not enough privileges to perform the operation'
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
