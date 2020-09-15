const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../index');
const formidable = require("formidable")
const auth = require('../middleware/auth');

var curUserId;

router.get('/', auth.verify, (req, res) => {
	curUserId = req.user.id;
	console.log(curUserId);
})

var jsonFile = null;
var testData = null;
router.post('/jsonUpload', auth.verify, async (req, res) => {
	var form = new formidable.IncomingForm();
	form.maxFileSize = 300 * 1024 * 1024;
	console.log(curUserId);
	form.parse(req);
	await form.on('file', async (name, file) => {
		let rawdata = fs.readFileSync(file.path);
		jsonFile = JSON.parse(rawdata)
		testData = heatMap(jsonFile)
		var d = new Date();
		await db.query("UPDATE user SET last_upload = " + d.getTime() + " where id = " + curUserId, () => { });
	});
	res.sendStatus(200);
});

router.post('/arrayUpload', async (req, res) => {
	let array = req.body;
	await parseData(jsonFile, array);
	res.sendStatus(200);
});

router.get('/download', (req, res) => {
	res.json(testData);
})

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2 - lat1);  // deg2rad below
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c; // Distance in km
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180)
}

async function parseData(jsonFile, coordinates) {
	return new Promise((resolve, reject) => {
		jsonFile.locations.forEach(async function iteration(value, index, array) {
			var skip = false;
			var lat = value.latitudeE7 * Math.pow(10, -7);
			var lng = value.longitudeE7 * Math.pow(10, -7);
			if (getDistanceFromLatLonInKm(lat, lng, 38.230462, 21.753150) > 10) {
				skip = true;
			} else {
				coordinates.forEach(function (element, i, table) {
					var lat_min = element[0].lat;
					var lat_max = element[2].lat;
					var lng_min = element[0].lng;
					var lng_max = element[2].lng;
					if (lat >= lat_min && lat <= lat_max && lng >= lng_min && lng <= lng_max)
						skip = true;
				});
			}

			if (!skip) {
				await insertInDatabase("INSERT INTO location VALUES (" + curUserId + "," + value.timestampMs + "," + value.latitudeE7 + "," + value.longitudeE7 + ")").then(result => {
					if (value.hasOwnProperty("activity")) {
						value.activity.forEach(async function iter(curActivity) {
							insActivity = curActivity.activity[0].type
							if (curActivity.activity[0].type === "ON_FOOT" || curActivity.activity[0].type === "IN_VEHICLE") {
								child_activities = ['IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'RUNNING', 'WALKING']
								curActivity.activity.forEach(function it(conActivity) {
									if (child_activities.includes(conActivity.type)) {
										insActivity = conActivity.type
									}
								});
							}
							await insertInDatabase("INSERT INTO activity VALUES (" + curUserId + "," + value.timestampMs + "," + curActivity.timestampMs + ",'" + insActivity + "')").then(result => {
								console.log(result);
							}).then(none => {resolve();});
						});
					} else {
						testData.data.forEach(function iteration(val, ind) {
							if (val.lat === value.latitudeE7 * Math.pow(10, -7) && val.lng === value.longitudeE7 * Math.pow(10, -7)) {
								testData.data.splice(ind, 1);
							}
						});
					}
				});
			}
		});
		// resolve();
	});
}

function heatMap(jsonFile) {
	var data = [];
	jsonFile.locations.forEach(function iteration(value, index, array) {
		var lat = value.latitudeE7 * Math.pow(10, -7);
		var lng = value.longitudeE7 * Math.pow(10, -7);
		var elem = { lat: lat, lng: lng, count: 1 };
		var found = false;
		found = data.some(function iteration(val, ind, arr) {
			if (val.lat === lat && val.lng === lng) {
				val.count += 1;
				return true;
			}
		})
		if (!found)
			data.push(elem)
	})

	tData = {
		max: data.length,
		data: data
	};

	return tData
}

async function insertInDatabase(query) {
	return new Promise((resolve, reject) => {
		db.query(query, (result) => {
			resolve(result);
		})
	})
}

module.exports = router;