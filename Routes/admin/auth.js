const express = require('express');
const { check, validationResult } = require('express-validator');

const usersRepo = require('../../repositories/users');
const signUpTemplate = require('../../views/admin/auth/signup');
const signInTemplate = require('../../views/admin/auth/signin');
const { requireEmail, requirePassword, passwordConfirm } = require('./validators');

const router = express.Router();

router.get('/signup', (req, res) => {
	res.send(signUpTemplate({ req }));
});

router.post('/signup', [ requireEmail, requirePassword, passwordConfirm ], async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.send(signUpTemplate({ req, errors }));
	}

	const { email, password } = req.body;
	const user = await usersRepo.create({ email, password });
	req.session.userId = user.id;
	res.send('Account Created!');
});

router.get('/signout', (req, res) => {
	req.session = null;
	res.send('you are signed out');
});

router.get('/signin', (req, res) => {
	res.send(signInTemplate({}));
});

router.post(
	'/signin',
	[
		check('email').trim().normalizeEmail().isEmail().withMessage('Must be a valid Email').custom(async (email) => {
			const foundUser = await usersRepo.getOneby({ email });
			if (!foundUser) {
				throw new Error("Email doesn't match any within our database!");
			}
		}),
		check('password').trim().custom(async (password, { req }) => {
			const foundUser = await usersRepo.getOneby({ email: req.body.email });

			if (!foundUser) {
				throw new Error('Password is incorrect');
			}

			const validPassword = await usersRepo.comparePasswords(foundUser.password, password);

			if (!validPassword) {
				throw new Error('Password is incorrect');
			}
		})
	],
	async (req, res) => {
		const errors = validationResult(req);
		console.log(errors);
		if (!errors.isEmpty()) {
			return res.send(signInTemplate({ req, errors }));
		}

		const { email } = req.body;
		const foundUser = await usersRepo.getOneby({ email });

		req.session.userId = foundUser.id;
		res.send(`You are signed in as ${foundUser.email}`);
	}
);

module.exports = router;
