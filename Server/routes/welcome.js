const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../index');
const auth = require('../middleware/auth');
const fs = require('fs');

router.get('/', (req, res) => {
	res.sendFile('D:/Coding/WebProject/Client/index.html');
});

// router.get('/testing', (req, res) => {
// 	res.render('D:/Coding/WebProject/Client/intro.html');
// })

router.post('/login', (req, res) => {
	console.log(req.body);
	db.query('SELECT EXISTS(SELECT * FROM user WHERE username = "' + req.body.username + '")', async (results) => {
		results = await db.getResult(results);
		if (results == 1) {
			db.query('SELECT password, id, isAdmin FROM user WHERE username = "' + req.body.username + '"', async (results) => {
				id = await results[0].id;
				isAdmin = await results[0].isAdmin;
				password = await results[0].password;
				if (req.body.password === password) {
					const token = auth.generateAuthToken(id, isAdmin);
					console.log(token);
					res.header('x-auth-token', token).send('Welcome ^.^');
				} else {
					res.status(401).send('Wrong Credentials');
				}
			});
		} else {
			res.status(401).send('Wrong Credentials');
		}
	});
});

router.post('/signup', (req, res) => {
	db.query('SELECT EXISTS(SELECT * FROM user WHERE username = "' + req.body.username + '")', async (results) => {
		results = await db.getResult(results);
		// results = results[0];
		// results = results[Object.keys(results)[0]];
		if (results == 1) {
			res.status(401).send('Nope!');
		} else {
			db.query('INSERT INTO user (username, password, email) VALUES ("' + req.body.username + '", "' + req.body.password + '", "' + req.body.email + '")', () => { });
		}
	});
});

module.exports = router;