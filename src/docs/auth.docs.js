import { AuthHeader } from './definitions';

export default {
	'/auth/login': {
		post: {
			summary: 'Login using email and password',
			description:
				'Authenticates a user, responds with a JSON Web Token if authenticated successfully',
			tags: ['auth'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				{
					in: 'body',
					name: 'Login Credentials',
					required: true,
					description: 'The login credentials to authenticate the user',
					schema: {
						type: 'object',
						required: ['email', 'password'],
						properties: {
							email: { type: 'string' },
							password: { type: 'string' }
						},
						example: {
							email: 'john@example.com',
							password: 'JohnDoe1!'
						}
					}
				}
			],
			responses: {
				200: { description: 'Authentication successful' },
				400: { summary: 'Invalid request', description: 'Validation error or wrong parameters' },
				401: { summary: 'Invalid credentials', description: 'The email or password is incorrect' },
				500: { description: 'Server error' }
			}
		}
	},
	'/auth/check': {
		get: {
			summary: 'Check if the user is authorized',
			description:
				'Authorizes a user, requires authorization header in Bearer <token> format and responds with the payload of JSON Web Token if the user is authorized',
			tags: ['auth'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [AuthHeader],
			responses: {
				200: { description: 'Authorization successful' },
				401: { summary: 'Invalid token', description: 'Missing auth header or invalid token' },
				500: { description: 'Server error' }
			}
		}
	},
	'/auth/refresh': {
		put: {
			summary: 'Get new refresh-auth token pair',
			description:
				'Refreshes the refresh token, requires authorization header in Bearer <token> format and responds with a new JSON Web Token pair',
			tags: ['auth'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [AuthHeader],
			responses: {
				200: { description: 'Refresh successful' },
				401: { summary: 'Invalid token', description: 'Missing auth header or invalid token' },
				500: { description: 'Server error' }
			}
		}
	}
};
