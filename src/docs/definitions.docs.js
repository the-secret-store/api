export const AuthHeader = {
	in: 'header',
	name: 'Authorization',
	description: 'Bearer authorization header',
	required: true,
	type: 'string',
	format: 'jwt'
};
