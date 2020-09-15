const intro = require('./routes/intro');
const welcome = require('./routes/welcome');
const upload = require('./routes/upload');

const mysql = require('mysql');
const express = require('express');
const app = express();
const cors = require('cors');

if (!process.env.jwtPrivateKey) {
	console.error('FATAL ERROR: jwtPrivateKey is not defined');
	process.exit(1);
}

var connection = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "1998@1998"
});

app.use(cors());
app.set('view-engine', 'ejs')
app.use(express.static('D:/Coding/WebProject/Client'));
app.use(express.json());
app.use('/', welcome);
app.use('/intro', intro);
app.use('/upload', upload);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}...`));

// function databaseQuery(sql) {
// 	return new Promise(())
// }

function query(sql, callback) {
	connection.query(sql, function (err, result) {
		if (err) throw err;
		callback(result);
	});
}
function getResult(results) {
	results = results[0];
	if (results != null) {
		results = results[Object.keys(results)[0]];
		return results;
	} else {
		return null;
	}
}

query("USE web;", () => { });

exports.query = query;
exports.getResult = getResult;






// app.use(express.static('public'));
// app.use(bodyParser.json());

// var con = mysql.createConnection({
// 	host: "127.0.0.1",
// 	user: "root",
// 	password: "1998@1998"
// });

// function query(sql, callback) {
// 	con.query(sql, async function (err, result) {
// 		if (err) throw err;
// 		callback(result);
// 	});
// }

// function getResult(results) {
// 	results = results[0];
// 	results = results[Object.keys(results)[0]];
// 	return results;
// 	// callback(results);
// }

// query("USE web;", () => { })

// function toDate(number) {
// 	var date = new Date(number * 1000);
// 	return date
// }

// app.listen(port, () => console.log(`Listening to ${port}...`));

// app.get('/', (req, res) => {
// 	res.sendFile(__dirname + '/public/login.html');
// });

// app.post('/login', function (req, res) {
// 	query('SELECT EXISTS(SELECT * FROM user WHERE username = "' + req.body.username + '")', async (results) => {
// 		results = await getResult(results);
// 		if (results == 1) {
// 			query('SELECT password FROM user WHERE username = "' + req.body.username + '"', async (results) => {
// 				results = await getResult(results);
// 				if (req.body.password === results) {
// 					res.redirect('intro');
// 				} else {
// 					res.send('Wrong Credentials');
// 				}
// 			});
// 		} else {
// 			res.send('Wrong Credentials');
// 		}
// 	});

// 	/**
// 	 * Get the credentials with
// 	 * req.body.username
// 	 * req.body.password
// 	 * and redirect to intro
// 	 * 
// 	 * if they are not correct respond with
// 	 * res.status(401).send('Nope');
// 	 */

// 	// No authentication has been implemented for the routes
// });

// app.get('/intro', (req, res) => {
// 	res.sendFile(__dirname + '/public/intro.html');
// })

// app.post('/signup', function (req, res) {
// 	query('SELECT EXISTS(SELECT * FROM user WHERE username = "' + req.body.username + '")', (results) => {
// 		results = results[0];
// 		results = results[Object.keys(results)[0]];
// 		if (results == 1) {
// 			res.status(401).send('Nope!');
// 		} else {
// 			query('INSERT INTO user (username, password, email) VALUES ("' + req.body.username + '", "' + req.body.password + '", "' + req.body.email + '")', () => { });
// 		}
// 	});

// 	// Redirect to Into

// 	// No authentication has been implemented for the routes
// })

// var jsonFile = null;
// var testData = null;
// var userId = 1;
// app.post('/jsonUpload', function (req, res) {
// 	var form = new formidable.IncomingForm();

// 	form.parse(req);

// 	form.on('file', function (name, file) {
// 		let rawdata = fs.readFileSync(file.path);
// 		jsonFile = JSON.parse(rawdata)
// 		testData = heatMap(jsonFile)
// 	});

// 	res.sendStatus(200);
// });

// app.get('/download', (req, res) => {
// 	res.json(testData);
// })

// var curUserId = "1"
// app.post('/arrayUpload', function (req, res) {
// 	let array = req.body
// 	//parseData(jsonFile,array)
// 	jsonFile.locations.forEach(function iteration(value, index, array) {
// 		query("INSERT INTO location VALUES (" + userId + "," + value.timestampMs + "," + value.latitudeE7 + "," + value.longitudeE7 + ")");
// 		if (value.hasOwnProperty("activity")) {
// 			value.activity.forEach(function iter(curActivity) {
// 				var i = 0;
// 				if (curActivity.activity[0].type === "ON_FOOT" || curActivity.activity[0].type === "ON_VEHICLE")
// 					i = 1;
// 				query("INSERT INTO activity VALUES (" + userId + "," + value.timestampMs + "," + curActivity.timestampMs + ",'" + curActivity.activity[i].type + "')");
// 			})
// 		}
// 	})
// 	res.sendStatus(200);
// });

// periodData = {
// 	labels: ["Walking", "Running", "On Vehicle"],
// 	weeks: {
// 		"Walking": {
// 			hour: "16:12",
// 			day: "Tuesday"
// 		},
// 		"Running": {
// 			hour: "07:52",
// 			day: "Saturday"
// 		},
// 		"On Vehicle": {
// 			hour: "23:27",
// 			day: "Friday"
// 		}
// 	},
// 	percentages: [25, 32, 43],
// 	heatmapData: {
// 		max: 15000,
// 		data: data = [
// 			{ lat: 38.2891471, lng: 21.7842876, count: 87 },
// 			{ lat: 38.292879299999996, lng: 21.7852864, count: 73 },
// 			{ lat: 38.2985032, lng: 21.7882902, count: 185 },
// 			{ lat: 38.2895204, lng: 21.783992599999998, count: 30 },
// 			{ lat: 38.3007907, lng: 21.7876673, count: 26 },
// 			{ lat: 38.3076412, lng: 21.809057799999998, count: 4 },
// 			{ lat: 38.293552, lng: 21.7915048, count: 7 },
// 			{ lat: 38.296835, lng: 21.7864769, count: 1 },
// 			{ lat: 38.292013499999996, lng: 21.7834254, count: 11 },
// 			{ lat: 38.292221399999995, lng: 21.782398, count: 3 },
// 			{ lat: 38.2779035, lng: 21.7625055, count: 5 },
// 			{ lat: 38.2642853, lng: 21.7438888, count: 1 },
// 			{ lat: 38.2574919, lng: 21.7412794, count: 7 },
// 			{ lat: 38.252228699999996, lng: 21.7395212, count: 1 },
// 			{ lat: 38.2506504, lng: 21.7384427, count: 1 },
// 			{ lat: 38.2472297, lng: 21.737024299999998, count: 1 },
// 			{ lat: 38.2474938, lng: 21.7362857, count: 6 },
// 			{ lat: 38.2440832, lng: 21.7326275, count: 4 },
// 			{ lat: 38.2396233, lng: 21.7285033, count: 1 },
// 			{ lat: 38.239435, lng: 21.72863, count: 1 },
// 			{ lat: 38.239401699999995, lng: 21.7286267, count: 2 },
// 			{ lat: 38.2396283, lng: 21.7292433, count: 1 },
// 			{ lat: 38.239554999999996, lng: 21.7294567, count: 1 },
// 			{ lat: 38.2394433, lng: 21.729606699999998, count: 1 },
// 			{ lat: 38.2392883, lng: 21.72977, count: 1 },
// 			{ lat: 38.23938, lng: 21.72987, count: 1 },
// 			{ lat: 38.239373799999996, lng: 21.7299206, count: 1 },
// 			{ lat: 38.239354999999996, lng: 21.7305133, count: 1 },
// 			{ lat: 38.239405, lng: 21.730601699999998, count: 1 },
// 			{ lat: 38.2397284, lng: 21.7308289, count: 1 },
// 			{ lat: 38.23992, lng: 21.73099, count: 1 },
// 			{ lat: 38.2400983, lng: 21.731019999999997, count: 1 },
// 			{ lat: 38.2402833, lng: 21.7312217, count: 1 },
// 			{ lat: 38.2404833, lng: 21.7311733, count: 1 },
// 			{ lat: 38.2406617, lng: 21.7311867, count: 1 },
// 			{ lat: 38.240836699999996, lng: 21.7311533, count: 1 },
// 			{ lat: 38.2410317, lng: 21.7309317, count: 1 },
// 			{ lat: 38.241126699999995, lng: 21.7305933, count: 1 },
// 			{ lat: 38.2413283, lng: 21.730478299999998, count: 1 },
// 			{ lat: 38.241505, lng: 21.730294999999998, count: 1 },
// 			{ lat: 38.241385, lng: 21.7295767, count: 1 },
// 			{ lat: 38.241833299999996, lng: 21.7301333, count: 1 },
// 			{ lat: 38.241943299999996, lng: 21.7301833, count: 1 },
// 			{ lat: 38.2419575, lng: 21.7301768, count: 1 },
// 			{ lat: 38.2419644, lng: 21.730175499999998, count: 1 },
// 			{ lat: 38.2416109, lng: 21.7297343, count: 1 },
// 			{ lat: 38.2406606, lng: 21.7287561, count: 1 },
// 			{ lat: 38.240246899999995, lng: 21.7292685, count: 1 },
// 			{ lat: 38.2400587, lng: 21.7300371, count: 1 },
// 			{ lat: 38.2394821, lng: 21.730933699999998, count: 1 },
// 			{ lat: 38.2390103, lng: 21.730782299999998, count: 1 },
// 			{ lat: 38.2391824, lng: 21.730502899999998, count: 15 },
// 			{ lat: 38.239016299999996, lng: 21.730700799999997, count: 5 },
// 			{ lat: 38.2391869, lng: 21.7304796, count: 4 },
// 			{ lat: 38.2390435, lng: 21.7307125, count: 1 },
// 			{ lat: 38.2391703, lng: 21.730514499999998, count: 2 },
// 			{ lat: 38.239014, lng: 21.730704799999998, count: 1 },
// 			{ lat: 38.2390239, lng: 21.7307125, count: 1 },
// 			{ lat: 38.2390557, lng: 21.730852199999998, count: 1 },
// 			{ lat: 38.2394683, lng: 21.729128799999998, count: 1 },
// 			{ lat: 38.2396501, lng: 21.7279876, count: 1 },
// 			{ lat: 38.2398479, lng: 21.727778, count: 1 },
// 			{ lat: 38.2399507, lng: 21.7277547, count: 1 },
// 			{ lat: 38.2396697, lng: 21.7279876, count: 1 },
// 			{ lat: 38.239867499999995, lng: 21.727778, count: 1 },
// 			{ lat: 38.239998299999996, lng: 21.7270382, count: 2 },
// 			{ lat: 38.2396153, lng: 21.7280353, count: 1 },
// 			{ lat: 38.270652, lng: 21.7469452, count: 1 },
// 			{ lat: 38.2700441, lng: 21.748459, count: 1 },
// 			{ lat: 38.2700909, lng: 21.748470599999997, count: 13 },
// 			{ lat: 38.270103, lng: 21.748459, count: 1 },
// 			{ lat: 38.2700834, lng: 21.748459, count: 1 },
// 			{ lat: 38.2700789, lng: 21.7484823, count: 1 },
// 			{ lat: 38.269144399999995, lng: 21.747810899999998, count: 1 },
// 			{ lat: 38.2698722, lng: 21.7491187, count: 13 },
// 			{ lat: 38.2698597, lng: 21.748296, count: 1 },
// 			{ lat: 38.2700879, lng: 21.748435699999998, count: 1 },
// 			{ lat: 38.270048599999996, lng: 21.748435699999998, count: 1 },
// 			{ lat: 38.2700921, lng: 21.7484456, count: 1 },
// 			{ lat: 38.270083799999995, lng: 21.748435399999998, count: 1 },
// 			{ lat: 38.2700769, lng: 21.7484239, count: 1 },
// 			{ lat: 38.270076499999995, lng: 21.7484233, count: 1 },
// 			{ lat: 38.2700768, lng: 21.748424, count: 2 },
// 			{ lat: 38.270078, lng: 21.7484462, count: 1 },
// 			{ lat: 38.2700938, lng: 21.7484476, count: 1 },
// 			{ lat: 38.270074699999995, lng: 21.748435, count: 1 },
// 			{ lat: 38.2700775, lng: 21.7484371, count: 1 },
// 			{ lat: 38.270075, lng: 21.7484206, count: 2 },
// 			{ lat: 38.2700873, lng: 21.748455399999997, count: 1 },
// 			{ lat: 38.2700819, lng: 21.748441099999997, count: 1 },
// 			{ lat: 38.2700909, lng: 21.748470299999997, count: 1 },
// 			{ lat: 38.2700883, lng: 21.7485006, count: 1 },
// 			{ lat: 38.270088799999996, lng: 21.7484873, count: 1 },
// 			{ lat: 38.270088799999996, lng: 21.7484871, count: 1 },
// 			{ lat: 38.2700891, lng: 21.7484888, count: 1 },
// 			{ lat: 38.2700895, lng: 21.748490399999998, count: 1 },
// 			{ lat: 38.2700843, lng: 21.7484651, count: 1 },
// 			{ lat: 38.270088799999996, lng: 21.7484866, count: 2 },
// 			{ lat: 38.2700847, lng: 21.748442999999998, count: 1 },
// 			{ lat: 38.2700846, lng: 21.7484428, count: 5 },

// 		]
// 	}
// }
// app.post('/periodUpload', function (req, res) {
// 	let array = req.body
// 	// array typeof {
// 	// 	first_month :first_month,
// 	// 	last_month :last_month,
// 	// 	first_year :first_year,
// 	// 	last_year :last_year 
// 	// } 

// 	//φτιαξε period data σύμφωνα με array
// 	res.sendStatus(200);
// });

// app.get('/downloadPeriodData', (req, res) => {
// 	res.json(periodData);
// })

// statData = {
// 	user: "John M.",
// 	dates: {
// 		startDate: new Date(2017, 3, 13),
// 		endDate: new Date(2020, 7, 18),
// 		lastUplaod: new Date(2020, 7, 10)
// 	},
// 	position: 46,
// 	score: {
// 		first: {
// 			name: "Marika L.",
// 			score: 92
// 		},
// 		second: {
// 			name: "Leopold II.",
// 			score: 87
// 		},
// 		third: {
// 			name: "Kanellis G.",
// 			score: 85
// 		}
// 	},
// 	percentages: [22, 75, 38, 90, 5, 22, 17, 46, 0, 0, 0, 0]
// }

// app.post('/statUpload', function (req, res) {
// 	//φτιαξε statdata

// 	res.sendStatus(200);
// });

// app.get('/downloadStatData', (req, res) => {
// 	res.json(statData);
// })

// dashData = {
// 	activity: {
// 		percentages: [22, 45, 17, 16],
// 		labels: ["On_Foot", "On_Vehicle", "Still", "Tilting"]
// 	},

// 	userSubs: [
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },
// 		{ name: "Ioanna", subs: 2341234 },

// 	],

// 	registries: {
// 		month: [234000, 74260, 530844, 150424, 310758, 98236, 195484, 124587, 57785, 203158, 375462, 145896],
// 		days: [2569852, 569852, 1023564, 926548, 1320149, 1301454, 745826],
// 		hour: [227121, 370170, 249662, 201345, 292205, 344726, 351090, 231178, 349678, 315611, 294979, 274930, 229110, 284614, 285775, 294594, 228322, 353226, 258034, 376812, 227643, 262215, 269853, 393429],
// 		avYears: [2017, 2018],
// 		years: [3567890, 2545643]
// 	}

// }
// app.post('/dashUpload', function (req, res) {
// 	//φτιαξε dashData

// 	res.sendStatus(200);
// });

// app.get('/downloadDashData', (req, res) => {
// 	res.json(dashData);
// })

// mapData = null;
// app.post('/mapUpload', function (req, res) {
// 	let mapPeriodData = req.body
// 	mapData = {
// 		max: 15000,
// 		data: data = [
// 			{ lat: 38.2891471, lng: 21.7842876, count: 87 },
// 			{ lat: 38.292879299999996, lng: 21.7852864, count: 73 },
// 			{ lat: 38.2985032, lng: 21.7882902, count: 185 },
// 			{ lat: 38.2895204, lng: 21.783992599999998, count: 30 },
// 			{ lat: 38.3007907, lng: 21.7876673, count: 26 },
// 			{ lat: 38.3076412, lng: 21.809057799999998, count: 4 },
// 			{ lat: 38.293552, lng: 21.7915048, count: 7 },
// 			{ lat: 38.296835, lng: 21.7864769, count: 1 },
// 			{ lat: 38.292013499999996, lng: 21.7834254, count: 11 },
// 			{ lat: 38.292221399999995, lng: 21.782398, count: 3 },
// 			{ lat: 38.2779035, lng: 21.7625055, count: 5 },
// 			{ lat: 38.2642853, lng: 21.7438888, count: 1 },
// 			{ lat: 38.2574919, lng: 21.7412794, count: 7 },
// 			{ lat: 38.252228699999996, lng: 21.7395212, count: 1 },
// 			{ lat: 38.2506504, lng: 21.7384427, count: 1 },
// 			{ lat: 38.2472297, lng: 21.737024299999998, count: 1 },
// 			{ lat: 38.2474938, lng: 21.7362857, count: 6 },
// 			{ lat: 38.2440832, lng: 21.7326275, count: 4 },
// 			{ lat: 38.2396233, lng: 21.7285033, count: 1 },
// 			{ lat: 38.239435, lng: 21.72863, count: 1 },
// 			{ lat: 38.239401699999995, lng: 21.7286267, count: 2 },
// 			{ lat: 38.2396283, lng: 21.7292433, count: 1 },
// 			{ lat: 38.239554999999996, lng: 21.7294567, count: 1 },
// 			{ lat: 38.2394433, lng: 21.729606699999998, count: 1 },
// 			{ lat: 38.2392883, lng: 21.72977, count: 1 },
// 			{ lat: 38.23938, lng: 21.72987, count: 1 },
// 			{ lat: 38.239373799999996, lng: 21.7299206, count: 1 },
// 			{ lat: 38.239354999999996, lng: 21.7305133, count: 1 },
// 			{ lat: 38.239405, lng: 21.730601699999998, count: 1 },
// 			{ lat: 38.2397284, lng: 21.7308289, count: 1 },
// 			{ lat: 38.23992, lng: 21.73099, count: 1 },
// 			{ lat: 38.2400983, lng: 21.731019999999997, count: 1 },
// 			{ lat: 38.2402833, lng: 21.7312217, count: 1 },
// 			{ lat: 38.2404833, lng: 21.7311733, count: 1 },
// 			{ lat: 38.2406617, lng: 21.7311867, count: 1 },
// 			{ lat: 38.240836699999996, lng: 21.7311533, count: 1 },
// 			{ lat: 38.2410317, lng: 21.7309317, count: 1 },
// 			{ lat: 38.241126699999995, lng: 21.7305933, count: 1 },
// 			{ lat: 38.2413283, lng: 21.730478299999998, count: 1 },
// 			{ lat: 38.241505, lng: 21.730294999999998, count: 1 },
// 			{ lat: 38.241385, lng: 21.7295767, count: 1 },
// 			{ lat: 38.241833299999996, lng: 21.7301333, count: 1 },
// 			{ lat: 38.241943299999996, lng: 21.7301833, count: 1 },
// 			{ lat: 38.2419575, lng: 21.7301768, count: 1 },
// 			{ lat: 38.2419644, lng: 21.730175499999998, count: 1 },
// 			{ lat: 38.2416109, lng: 21.7297343, count: 1 },
// 			{ lat: 38.2406606, lng: 21.7287561, count: 1 },
// 			{ lat: 38.240246899999995, lng: 21.7292685, count: 1 },
// 			{ lat: 38.2400587, lng: 21.7300371, count: 1 },
// 			{ lat: 38.2394821, lng: 21.730933699999998, count: 1 },
// 			{ lat: 38.2390103, lng: 21.730782299999998, count: 1 },
// 			{ lat: 38.2391824, lng: 21.730502899999998, count: 15 },
// 			{ lat: 38.239016299999996, lng: 21.730700799999997, count: 5 },
// 			{ lat: 38.2391869, lng: 21.7304796, count: 4 },
// 			{ lat: 38.2390435, lng: 21.7307125, count: 1 },
// 			{ lat: 38.2391703, lng: 21.730514499999998, count: 2 },
// 			{ lat: 38.239014, lng: 21.730704799999998, count: 1 },
// 			{ lat: 38.2390239, lng: 21.7307125, count: 1 },
// 			{ lat: 38.2390557, lng: 21.730852199999998, count: 1 },
// 			{ lat: 38.2394683, lng: 21.729128799999998, count: 1 },
// 			{ lat: 38.2396501, lng: 21.7279876, count: 1 },
// 			{ lat: 38.2398479, lng: 21.727778, count: 1 },
// 			{ lat: 38.2399507, lng: 21.7277547, count: 1 },
// 			{ lat: 38.2396697, lng: 21.7279876, count: 1 },
// 			{ lat: 38.239867499999995, lng: 21.727778, count: 1 },
// 			{ lat: 38.239998299999996, lng: 21.7270382, count: 2 },
// 			{ lat: 38.2396153, lng: 21.7280353, count: 1 },
// 			{ lat: 38.270652, lng: 21.7469452, count: 1 },
// 			{ lat: 38.2700441, lng: 21.748459, count: 1 },
// 			{ lat: 38.2700909, lng: 21.748470599999997, count: 13 },
// 			{ lat: 38.270103, lng: 21.748459, count: 1 },
// 			{ lat: 38.2700834, lng: 21.748459, count: 1 },
// 			{ lat: 38.2700789, lng: 21.7484823, count: 1 },
// 			{ lat: 38.269144399999995, lng: 21.747810899999998, count: 1 },
// 			{ lat: 38.2698722, lng: 21.7491187, count: 13 },
// 			{ lat: 38.2698597, lng: 21.748296, count: 1 },
// 			{ lat: 38.2700879, lng: 21.748435699999998, count: 1 },
// 			{ lat: 38.270048599999996, lng: 21.748435699999998, count: 1 },
// 			{ lat: 38.2700921, lng: 21.7484456, count: 1 },
// 			{ lat: 38.270083799999995, lng: 21.748435399999998, count: 1 },
// 			{ lat: 38.2700769, lng: 21.7484239, count: 1 },
// 			{ lat: 38.270076499999995, lng: 21.7484233, count: 1 },
// 			{ lat: 38.2700768, lng: 21.748424, count: 2 },
// 			{ lat: 38.270078, lng: 21.7484462, count: 1 },
// 			{ lat: 38.2700938, lng: 21.7484476, count: 1 },
// 			{ lat: 38.270074699999995, lng: 21.748435, count: 1 },
// 			{ lat: 38.2700775, lng: 21.7484371, count: 1 },
// 			{ lat: 38.270075, lng: 21.7484206, count: 2 },
// 			{ lat: 38.2700873, lng: 21.748455399999997, count: 1 },
// 			{ lat: 38.2700819, lng: 21.748441099999997, count: 1 },
// 			{ lat: 38.2700909, lng: 21.748470299999997, count: 1 },
// 			{ lat: 38.2700883, lng: 21.7485006, count: 1 },
// 			{ lat: 38.270088799999996, lng: 21.7484873, count: 1 },
// 			{ lat: 38.270088799999996, lng: 21.7484871, count: 1 },
// 			{ lat: 38.2700891, lng: 21.7484888, count: 1 },
// 			{ lat: 38.2700895, lng: 21.748490399999998, count: 1 },
// 			{ lat: 38.2700843, lng: 21.7484651, count: 1 },
// 			{ lat: 38.270088799999996, lng: 21.7484866, count: 2 },
// 			{ lat: 38.2700847, lng: 21.748442999999998, count: 1 },
// 			{ lat: 38.2700846, lng: 21.7484428, count: 5 },

// 		]
// 	}

// 	//calculate mapData
// 	res.sendStatus(200);
// });

// app.get('/downloadmapData', (req, res) => {
// 	res.json(mapData);
// })

// //Works but O(n^2) and store to base
// function parseData(jsonFile, coordinates) {
// 	indexes = []
// 	jsonFile.locations.forEach(function iteration(value, index, array) {
// 		var lat = value.latitudeE7 * Math.pow(10, -7);
// 		var lng = value.longitudeE7 * Math.pow(10, -7);
// 		if (getDistanceFromLatLonInKm(lat, lng, 38.230462, 21.753150) > 10) {
// 			indexes.push(value)
// 		} else {
// 			coordinates.forEach(function (element, i, table) {
// 				var lat_min = element[0].lat;
// 				var lat_max = element[2].lat;
// 				var lng_min = element[0].lng;
// 				var lng_max = element[2].lng;
// 				if (lat >= lat_min && lat <= lat_max && lng >= lng_min && lng <= lng_max)
// 					indexes.push(value)
// 			})
// 		}
// 	})

// 	indexes.forEach(function iteration(value, index, array) {
// 		jsonFile.locations.splice(jsonFile.locations.indexOf(value), 1)
// 	})


// 	testData = heatMap(jsonFile)
// 	//store to base

// }

// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
// 	var R = 6371; // Radius of the earth in km
// 	var dLat = deg2rad(lat2 - lat1);  // deg2rad below
// 	var dLon = deg2rad(lon2 - lon1);
// 	var a =
// 		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// 		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
// 		Math.sin(dLon / 2) * Math.sin(dLon / 2)
// 		;
// 	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// 	var d = R * c; // Distance in km
// 	return d;
// }

// function deg2rad(deg) {
// 	return deg * (Math.PI / 180)
// }

// function heatMap(jsonFile) {
// 	var data = [];
// 	jsonFile.locations.forEach(function iteration(value, index, array) {
// 		var lat = value.latitudeE7 * Math.pow(10, -7);
// 		var lng = value.longitudeE7 * Math.pow(10, -7);
// 		var elem = { lat: lat, lng: lng, count: 1 };
// 		var found = false;
// 		found = data.some(function iteration(val, ind, arr) {
// 			if (val.lat === lat && val.lng === lng) {
// 				val.count += 1;
// 				return true;
// 			}
// 		})
// 		if (!found)
// 			data.push(elem)
// 	})

// 	var testData = {
// 		max: data.length,
// 		data: data
// 	};

// 	return testData
// }
