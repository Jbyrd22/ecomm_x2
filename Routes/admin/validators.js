const { check } = require('express-validator');
const usersRepo = require('../../repositories/users');

module.exports = {
	requireEmail    : check('email')
		.trim()
		.normalizeEmail()
		.isEmail()
		.withMessage('Must be a valid email')
		.custom(async (email) => {
			const foundUser = await usersRepo.getOneby({ email });
			if (foundUser) {
				throw new Error('Email in Use');
			}
		}),
	requirePassword : check('password')
		.trim()
		.isLength({ min: 4, max: 20 })
		.withMessage('Must be between 4 and 20 characters'),
	passwordConfirm : check('passwordConfirmation')
		.trim()
		.isLength({ min: 4, max: 20 })
		.withMessage('Must be between 4 and 20 characters')
		.custom((passwordConfirmation, { req }) => {
			if (req.body.password !== passwordConfirmation) {
				throw new Error('Passwords do not match!');
			}

			return true;
		})
};
