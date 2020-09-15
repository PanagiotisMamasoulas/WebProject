var d = new Date();
var n = d.getMonth();
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octomber', 'November', 'December'];
var month = months[n];

function tableElement(element, row) {
	td = document.createElement('td');
	td.appendChild(document.createTextNode(element));
	row.appendChild(td);
}

function tableRow(elements, table) {
	tr = document.createElement('tr');

	elements.forEach(function iteration(value, index, array) {
		tableElement(value, tr)
	})

	table.appendChild(tr);
}

statData = null;

$.ajax({
	url: 'http://localhost:3000/intro',
	cache: false,
	contentType: "application/json",
	processData: false,
	method: 'GET',
	headers: { 'x-auth-token': localStorage.getItem('x-auth-token') },
	success: function (data, status, request) {
		loadPage(data);
	},
	fail: function(data, status, request) {
		alert('You have been logged out');
		window.location.replace('index.html');
	}
});


function loadPage(statData) {
	score = statData.percentages[n]

	document.getElementById("wText").innerHTML = "Welcome again " + statData.user;
	document.getElementById("wScore").innerHTML = "Your Score for the month " + month + " is " + score + "%";
	document.getElementById("wPeriod").innerHTML = statData.dates.startDate + " - " + statData.dates.endDate + "!";
	document.getElementById("wUpload").innerHTML = statData.dates.lastUpload;
	document.getElementById("leaderB").innerHTML = "The leaderboard for the month " + month;



	var table = document.getElementById('tblUser');
	tableRow(['1.', statData.score.first.name, statData.score.first.score + "%"], table)
	tableRow(['2.', statData.score.second.name, statData.score.second.score + "%"], table)
	tableRow(['3.', statData.score.third.name, statData.score.third.score + "%"], table)
	tableRow(['..', "........", "..."], table)
	tableRow([statData.position + ".", statData.user, score + "%"], table)

	for (i = 0; i <= n; i++) {
		months.push(months.shift());
		statData.percentages.push(statData.percentages.shift());
	}
	var ctl = document.getElementById("lineChart").getContext('2d');
	var chart = new Chart(ctl, {
		// The type of chart we want to create
		type: 'line',

		// The data for our dataset
		data: {
			labels: months,
			datasets: [{
				label: 'Οικολογικές Μετακινήσεις',
				backgroundColor: 'rgb(51, 204, 51)',
				borderColor: 'rgb(1, 252, 0)',
				data: statData.percentages
			}]
		},

		// Configuration options go here
		options: {
			tooltips: {
				callbacks: {

					label: function (tooltipItem, data) {
						var dataset = data.datasets[tooltipItem.datasetIndex];

						var currentValue = dataset.data[tooltipItem.index];

						return currentValue + "%";
					}
				}
			}
		}
	});

	var ctp = document.getElementById("pieChart").getContext('2d');
	var myPieChart = new Chart(ctp, {
		type: 'doughnut',
		data: {
			datasets: [{
				data: [score, 100 - score],
				backgroundColor: ["rgb(51, 204, 51)", "rgb(255, 0, 0)"]
			}],
			labels: [
				'Οικολογικές Μετακηνίσεις',
				'Μη-Οικολογικές Μετακηνίσεις'
			]
		},
		options: {
			legend: {
				position: 'bottom'
			},
			tooltips: {
				callbacks: {
					label: function (tooltipItem, data) {
						var dataset = data.datasets[tooltipItem.datasetIndex];
						var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
							return previousValue + currentValue;
						});
						var currentValue = dataset.data[tooltipItem.index];
						var precentage = Math.floor(((currentValue / total) * 100) + 0.5);
						return precentage + "%";
					}
				}
			}
		}
	});
}
