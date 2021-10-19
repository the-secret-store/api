export default function obtainTokenFromRequest(req) {
	const { authorization } = req.headers;
	if (authorization) {
		const token = authorization.split(' ')[1];
		return token;
	}
	return null;
}
