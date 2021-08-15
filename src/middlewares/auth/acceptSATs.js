import { StatusCodes } from 'http-status-codes';
import { SpecialAccessToken } from '@models';
import { JoiObjectId } from '@validation/schemas';

export default async (req, res, next) => {
	const specialAccessToken = req.headers['special-access-token'];
	if (!specialAccessToken) {
		return next();
	}

	const { error } = JoiObjectId().required().validate(specialAccessToken);
	if (error) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: error.details[0].message, details: error.details });
	}

	const sat = await SpecialAccessToken.findById(specialAccessToken);

	if (!sat) {
		return res
			.status(StatusCodes.UNAUTHORIZED)
			.json({ message: 'The token is either invalid or no longer exist' });
	}

	req.user = { display_name: 'Special Access User', id: specialAccessToken };
	req.isSAU = true;
	next();
};
