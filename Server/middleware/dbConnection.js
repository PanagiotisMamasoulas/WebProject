function query(sql, callback) {
	window.con.query(sql, async function (err, result) {
		if (err) throw err;
		callback(result);
	});
}
function getResult(results) {
	results = results[0];
	results = results[Object.keys(results)[0]];
	return results;
	// callback(results);
}

query("USE web;", () => { });