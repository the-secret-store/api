import bcrypt from 'bcryptjs';
import config from 'config';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import User from '@models/user.model';
import logger from '@tools/logging';

const TOKEN_PRIVATE_KEY = config.get('secretKey');

export const login = async (req, res) => {
	const { email, password } = req.body;
	logger.debug('Acknowledged: ' + { email, password });

	const user = await User.findOne({ email });
	if (!user) {
		return res.status(StatusCodes.UNAUTHORIZED).json({
			message: 'Email does not exist in out records.'
		});
	}

	const authenticated = await bcrypt.compare(password, user.password);
	if (!authenticated) {
		return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Wrong password' });
	}

	const { id, displayName } = user;
	const token = jwt.sign({ id, displayName }, TOKEN_PRIVATE_KEY);

	return res
		.status(StatusCodes.ACCEPTED)
		.json({ message: 'Authenticated successfully', data: token });
};
