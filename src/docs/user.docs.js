import { AuthHeader } from './definitions';

export default {
	'/user/register': {
		post: {
			summary: 'Register a new user',
			description: 'Create a new user',
			tags: ['user'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				{
					in: 'body',
					name: 'User details',
					description: 'The user object to register',
					required: true,
					schema: {
						type: 'object',
						required: ['display_name', 'email', 'password'],
						properties: {
							display_name: { type: 'string' },
							email: { type: 'string' },
							password: { type: 'string' }
						},
						example: {
							display_name: 'John Doe',
							email: 'john@email.com',
							password: 'Doe,John1!'
						}
					}
				}
			],
			responses: {
				201: { description: 'Registration successful' },
				400: { summary: 'Invalid request', description: 'Validation error or wrong parameters' },
				500: { description: 'Server error' }
			}
		}
	},
	'/user/changePassword': {
		put: {
			summary: 'Change the password of a user',
			description: 'Update the password of the logged in user',
			tags: ['user'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				{
					in: 'body',
					name: 'Password change parameters',
					description: 'The password change parameters',
					required: true,
					schema: {
						type: 'object',
						required: ['currentPassword', 'newPassword', 'newPasswordConfirmation'],
						properties: {
							currentPassword: { type: 'string' },
							newPassword: { type: 'string' },
							newPasswordConfirmation: { type: 'string' }
						},
						example: {
							currentPassword: 'Doe,John1!',
							newPassword: 'JohnDoe2@',
							newPasswordConfirmation: 'JohnDoe2@'
						}
					}
				}
			],
			responses: {
				200: { description: 'Password change successful' },
				400: { summary: 'Invalid request', description: 'Validation error or wrong parameters' },
				500: { description: 'Server error' }
			}
		}
	}
};
