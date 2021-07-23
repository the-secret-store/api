export default {
	'/verify/get-otp': {
		get: {
			summary: 'Send verification code to an authorized user',
			description:
				'Sends email with a verification code to an authorized user, requires authorization header in Bearer <token> format',
			consumes: 'application/json',
			parameters: [
				{
					in: 'header',
					name: 'JWT',
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
	}
};
