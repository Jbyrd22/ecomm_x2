const express = require('express');
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');

const router = express.Router();

router.get('/signup', (req, res) => {
	res.send(signupTemplate({ req }));
});

router.post('/signup', async (req, res) => {
	const { email, password, passwordConfirmation } = req.body;
	const foundUser = await usersRepo.getOneby({ email });
	if (foundUser) {
		return res.send('Email is already in use.');
	}
	if (password !== passwordConfirmation) {
		return res.send('Passwords do not match!');
	}
	const user = await usersRepo.create({ email, password });
	req.session.userId = user.id;
	res.send('Account Created!');
});

router.get('/signout', (req, res) => {
	req.session = null;
	res.send('you are signed out');
});

router.get('/signin', (req, res) => {
	res.send(`
		<div>
			<form method="POST">
				<input name="email" placeholder="email" />				
				<input name="password" placeholder="password" />				
				<button>Sign In</button>
			</form>		
		</div>
	`);
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
