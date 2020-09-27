const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const usersRepo = require('./repositories/users');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	cookieSession({
		keys : [ 'devildogs' ]
	})
);

app.get('/signup', (req, res) => {
	res.send(`
		<div>
			<form method="POST">
				<input name="email" placeholder="email" />				
				<input name="password" placeholder="password" />				
				<input name="passwordConfirmation" placeholder="password confirmation" />
				<button>Sign Up</button>
			</form>		
		</div>
	`);
});

app.post('/signup', async (req, res) => {
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

app.get('/signout', (req, res) => {
	req.session = null;
	res.send('you are signed out');
});

app.get('/signin', (req, res) => {
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

app.post('/signin', async (req, res) => {
	const { email, password } = req.body;
	const foundUser = await usersRepo.getOneby({ email });
	if (!foundUser) {
		return res.send("That email doesn't exist in our database.");
	}
	if (password !== foundUser.password) {
		return res.send('You have entered an incorrect password!');
	}
	req.session.userId = foundUser.id;
	res.send(`You are signed in as ${foundUser.email}`);
});

app.listen(3000, () => {
	console.log('Ecomm App Has Started');
});
