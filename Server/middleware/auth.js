const jwt = require('jsonwebtoken');
const db = require('../index');

verify = (req, res, next) => {
	const token = req.header('x-auth-token');
	if (!token) return res.status(401).send('Access denied. No token provided');
	try {
		const decoded = jwt.verify(token, process.env.jwtPrivateKey);
		req.user = decoded;
		db.query('SELECT EXISTS(SELECT * FROM user WHERE id="' + req.user.id + '")', async (result) => {
			result = await db.getResult(result);
			if(result == 1) {
				next();
			} else {
				res.status(401).send('Access denied. Wrong user');
			}
		})
	} catch (ex) {
		res.status(400).send('Invalid token');
	}
}

generateAuthToken = (id, isAdmin) => {
	const token = jwt.sign({ id: id, isAdmin: isAdmin }, process.env.jwtPrivateKey);
	return token;
}

exports.verify = verify;
exports.generateAuthToken = generateAuthToken;