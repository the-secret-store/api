export default {
	'/verify/get-otp': {
		get: {
			summary: 'Send verification code to an authorized user',
			description:
				'Sends email with a verification code to an authorized user, requires authorization header in Bearer <token> format',
			tags: ['verify'],
			consumes: 'application/json',
			parameters: [
				{
					in: 'header',
					name: 'JWT',
					required: true,
					description: 'The JSON Web Token to authorize',
					schema: {
						type: 'string'
					}
				}
			],
			responses: {
				200: { description: 'Verification email sent successfully' },
				401: { summary: 'Invalid token', description: 'Missing auth header or invalid token' },
				500: { description: 'Server error' }
			}
		}
	},
	'/verify/check': {
		post: {
			summary: 'Verify the user with otp',
			description:
				'Sets the logged in user as verified using verification code, requires authorization header in Bearer <token> format and otp in the body',
			tags: ['verify'],
			consumes: 'application/json',
			parameters: [
				{
					in: 'header',
					name: 'JWT',
					required: true,
					description: 'The JSON Web Token to authorize',
					schema: {
						type: 'string'
					}
				},
				{
					in: 'body',
					description: 'The verification code',
					type: 'object',
					required: ['otp'],
					properties: {
						otp: { type: 'number' }
					},
					example: { otp: 567890 }
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
