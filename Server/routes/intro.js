const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth');
const db = require('../index');
const Promise = require('promise');
const { resolveInclude } = require('ejs');

router.get('/', auth.verify, async (req, res) => {

	var statData = {
		user: null,
		dates: {
			startDate: null,
			endDate: null,
			lastUpload: null
		},
		position: null,
		score: null,
		percentages: []
	};

	statData.user = await db.getResult(await getStatData("SELECT username from user where id =" + req.user.id));
	// await db.query("SELECT username from user where id =" + req.user.id, (result) => {
	// 	statData.user = result[0].username;
	// 	// console.log(statData);
	// 	// res.send(statData);
	// });

	statData.dates.startDate = new Date(await db.getResult(await getStatData("SELECT MIN(time) from location where user_id =" + req.user.id))).toDateString();
	// await new Promise((resolve) => {
	// 	db.query("SELECT MIN(time) from location where user_id =" + req.user.id, (result) => {
	// 		console.log(result[0]);
	// 		statData.dates.startDate = result[0]["MIN(time)"];
	// 		resolve();
	// 	})
	// });

	statData.dates.endDate = new Date(await db.getResult(await getStatData("SELECT MAX(time) from location where user_id =" + req.user.id))).toDateString();
	// db.query("SELECT MAX(time) from location where user_id =" + req.user.id, (result) => {
	// 	date = new Date(JSON.parse(JSON.stringify(result[0]))['MAX(time)'])
	// 	statData.dates.endDate = date.toDateString()
	// });

	statData.dates.lastUpload = new Date(await db.getResult(await getStatData("SELECT last_upload from user where id =" + req.user.id))).toDateString();
	// db.query("SELECT last_upload from user where id =" + req.user.id, (result) => {
	// 	date = new Date(JSON.parse(JSON.stringify(result[0]))['last_upload'])
	// 	statData.dates.lastUplaod = date.toDateString()
	// });

	await getStatData("SELECT time,type from activity where location_user_id =" + req.user.id).then(result => {

		var d = new Date();
		var curYear = d.getFullYear();
		var curMonth = d.getMonth();

		months = [{ green: 0, red: 0 },
		{ green: 0, red: 0 }, { green: 0, red: 0 }, { green: 0, red: 0 }, { green: 0, red: 0 }, { green: 0, red: 0 },
		{ green: 0, red: 0 }, { green: 0, red: 0 }, { green: 0, red: 0 }, { green: 0, red: 0 }, { green: 0, red: 0 },
		{ green: 0, red: 0 }]

		greenTypes = ['ON_BICYCLE', 'ON_FOOT', 'RUNNING', 'WALKING']
		redTypes = ['EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE']
		neutralTypes = ['STILL', 'TILTING', 'UNKNOWN']

		result.forEach(function iteration(value) {
			date = new Date(value.time)
			month = date.getMonth()
			year = date.getFullYear()
			if (month <= curMonth) {
				if (year === curYear) {
					if (greenTypes.includes(value.type))
						months[month].green++;
					if (redTypes.includes(value.type))
						months[month].red++;
				}
			} else {
				if (year === curYear) {
					if (greenTypes.includes(value.type))
						months[month].green++;
					if (redTypes.includes(value.type))
						months[month].red++;
				}
			}
		});
		months.forEach(function iterate(value) {
			percentage = ((value.green / (value.green + value.red)) * 100).toFixed(2);
			if (percentage === 'NaN') percentage = 0;
			statData.percentages.push(percentage)
		});
	});
	// db.query("SELECT time,type from activity where location_user_id =" + req.user.id, (result) => {

	// 	results = JSON.parse(JSON.stringify(result))
	// 	var d = new Date();
	// 	var curYear = d.getFullYear();
	// 	var curMonth = d.getMonth();

	// 	results.forEach(function iteration(value) {
	// 		date = new Date(value.time)
	// 		month = date.getMonth()
	// 		year = date.getFullYear()
	// 		if (month <= curMonth) {
	// 			if (year === curYear) {
	// 				if (greenTypes.includes(value.type))
	// 					months[month].green++;
	// 				if (redTypes.includes(value.type))
	// 					months[month].red++;
	// 			}
	// 		} else {
	// 			if (year === curYear - 1) {
	// 				if (greenTypes.includes(value.type))
	// 					months[month].green++;
	// 				if (redTypes.includes(value.type))
	// 					months[month].red++;
	// 			}
	// 		}
	// 	})
	// 	months.forEach(function iterate(value) {
	// 		percentage = ((value.green / (value.green + value.red)) * 100).toFixed(2);
	// 		if (percentage === 'NaN') percentage = 0;
	// 		statData.percentages.push(percentage)
	// 	})
	// });

	await getStatData("SELECT username,id,time,type from user JOIN activity on id = location_user_id").then(result => {

		greenTypes = ['ON_BICYCLE', 'ON_FOOT', 'RUNNING', 'WALKING']
		redTypes = ['EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE']
		neutralTypes = ['STILL', 'TILTING', 'UNKNOWN']
		var d = new Date();
		var curMonth = d.getMonth() + 1; //January is 0!
		var curYear = d.getFullYear();

		finScores = []

		results = JSON.parse(JSON.stringify(result))

		if (!(typeof results[0] !== undefined))
		req.user.id = results[0].id
		tempScores = { green: 0, red: 0 }
		results.forEach(function iteration(value, index, array) {
			if (req.user.id !== value.id || ((typeof array[index + 1]) === 'undefined')) {
				req.user.id = value.id
				if ((typeof array[index + 1]) === 'undefined') {
					date = new Date(value.time)
					month = date.getMonth()
					year = date.getFullYear()

					if (year === curYear && month === curMonth) {
						if (greenTypes.includes(value.type))
							tempScores.green++;
						if (redTypes.includes(value.type))
							tempScores.red++;
					}
				}
				percentage = ((tempScores.green / (tempScores.green + tempScores.red)) * 100).toFixed(2);
				finScores.push({ name: array[index - 1].username, score: percentage, id: array[index - 1].id })
				tempScores = { green: 0, red: 0 }
			}
			else {
				date = new Date(value.time);
				month = date.getMonth() + 1;
				year = date.getFullYear();

				if (year === curYear && month === curMonth) {
					if (greenTypes.includes(value.type))
						tempScores.green++;
					if (redTypes.includes(value.type))
						tempScores.red++;
				}
			}
		})

		finScores.sort(function (a, b) {
			var keyA = new Date(a.score),
				keyB = new Date(b.score);
			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
			return 0;
		});

		statData.position = finScores.findIndex((person) => {
			return person.id == req.user.id
		}) + 1;
		statData.score = {
			first: {
				name: (typeof finScores[0] === 'undefined') ? "no_data" : finScores[0].name,
				score: (typeof finScores[0] === 'undefined') ? "no_data" : finScores[0].score
			},
			second: {
				name: (typeof finScores[1] === 'undefined') ? "no_data" : finScores[1].name,
				score: (typeof finScores[1] === 'undefined') ? "no_data" : finScores[1].score
			},
			third: {
				name: (typeof finScores[2] === 'undefined') ? "no_data" : finScores[2].name,
				score: (typeof finScores[2] === 'undefined') ? "no_data" : finScores[2].score
			}
		}
	});
	console.log(statData);
	res.send(statData);
});

async function getStatData(query) {
	return new Promise((resolve, reject) => {
		db.query(query, (result) => {
			resolve(result);
		})
	})
}

module.exports = router;