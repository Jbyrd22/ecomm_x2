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
	console.log(errors);
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
	res.send(signInTemplate());
});

router.post('/signin', async (req, res) => {
	const { email, password } = req.body;
	const foundUser = await usersRepo.getOneby({ email });
	if (!foundUser) {
		return res.send("That email doesn't exist in our database.");
	}

	const validPassword = await usersRepo.comparePasswords(foundUser.password, password);

	if (!validPassword) {
		return res.send('You have entered an incorrect password!');
	}
	req.session.userId = foundUser.id;
	res.send(`You are signed in as ${foundUser.email}`);
});

module.exports = router;
