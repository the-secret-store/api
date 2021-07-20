export default {
	'/user/register': {
		post: {
			summary: 'Register a new user',
			description: 'Create a new user',
			consumes: 'application/json',
			parameters: [
				{
					in: 'body',
					name: 'user',
					description: 'The user object to register',
					schema: {
						type: 'object',
						required: ['display_name', 'email', 'password'],
						properties: {
							display_name: { type: 'string' },
							email: { type: 'string' },
							password: { type: 'string' }
						}
					}
				}
			],
			responses: {
				200: { description: 'Registration successful' },
				400: { summary: 'Invalid request', description: 'Validation error or wrong parameters' },
				500: { description: 'Server error' }
			}
		}
	}
};
