import { AuthHeader } from './definitions';

export default {
	'/verify/get-otp': {
		patch: {
			summary: 'Send verification code to an authorized user',
			description:
				'Sends email with a verification code to an authorized user, requires authorization header in Bearer <token> format',
			tags: ['verify'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [AuthHeader],
			responses: {
				200: { description: 'Verification email sent successfully' },
				401: { summary: 'Invalid token', description: 'Missing auth header or invalid token' },
				500: { description: 'Server error' }
			}
		}
	},
	'/verify/check': {
		put: {
			summary: 'Verify the user with otp',
			description:
				'Sets the logged in user as verified using verification code, requires authorization header in Bearer <token> format and otp in the body',
			tags: ['verify'],
			consumes: 'application/json',
			produces: 'application/json',
			parameters: [
				AuthHeader,
				{
					in: 'body',
					name: 'Verification Code',
					description: 'The verification code',
					required: true,
					schema: {
						type: 'object',
						required: ['otp'],
						properties: {
							otp: { type: 'number' }
						},
						example: { otp: 567890 }
					}
				}
			],
			responses: {
				200: { description: 'Verification email sent successfully' },
				401: { summary: 'Invalid token', description: 'Missing auth header or invalid token' },
				500: { description: 'Server error' }
			}
		}
	}
};
