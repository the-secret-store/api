import PasswordComplexity from 'joi-password-complexity';

export default function () {
	return new PasswordComplexity({
		min: 6,
		max: 18,
		lowerCase: 1,
		upperCase: 1,
		numeric: 1,
		symbol: 1,
		requirementCount: 4
	});
}
