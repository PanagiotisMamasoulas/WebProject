generateAuthToken = function(id, admin) {
	const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
	return token;
}