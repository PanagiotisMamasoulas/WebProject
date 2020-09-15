$.ajax({
	url: 'http://localhost:3000/upload',
	cache: false,
	contentType: "application/json",
	processData: false,
	method: 'GET',
	headers: { 'x-auth-token': localStorage.getItem('x-auth-token') },
	success: (data, status, request) => {
		console.log(data);
	},
	fail: (data, status, request) => {
		alert('You have been logged out');
		window.location.replace('index.html');
	}
});

var map = L.map('mapid').setView([38.230462, 21.753150], 12);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox/streets-v11',
	tileSize: 512,
	zoomOffset: -1
}).addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
	draw: {
		polygon: false,
		marker: false,
		circle: false,
		polyline: false
	},
	edit: {
		featureGroup: drawnItems
	}
});

map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
	var layer = event.layer;
	drawnItems.addLayer(layer);
});

function getLayers() {
	var coordinates = [];
	map.eachLayer(function (e) {
		if (e instanceof L.Rectangle) {
			coordinates.push(e.getLatLngs()[0]) //Layers to eliminate
		}
	});

	$.ajax({
		url: 'http://localhost:3000/upload/arrayUpload',
		data: JSON.stringify(coordinates),
		cache: false,
		contentType: "application/json",
		processData: false,
		method: 'POST',
		headers: { 'x-auth-token': localStorage.getItem('x-auth-token') },
		success: () => {
			$.ajax({
				url: 'http://localhost:3000/upload/download',
				method: 'GET',
				success: (data, status, request) => {
					createHeat(data);
					document.getElementById("uComplete").style.display = "block";
				}
			});
		}
	});

	document.getElementById("doneB").disabled = true;
	document.getElementById("myFile").disabled = true;
	drawControl.remove()
}

const fileSelector = document.getElementById('myFile');
document.getElementById('myFile').value = "";
fileSelector.addEventListener('change', (event) => {
	const file = event.target.files[0];

	var data = new FormData();
	data.append('json', file);
	$.ajax({
		url: 'http://localhost:3000/upload/jsonUpload',
		data: data,
		cache: false,
		contentType: false,
		processData: false,
		method: 'POST',
		headers: { 'x-auth-token': localStorage.getItem('x-auth-token') },
		success: () => {
			$.ajax({
				url: 'http://localhost:3000/upload/download',
				method: 'GET',
				success: (data, status, request) => {
					createHeat(data);
					document.getElementById("gLine2").style.display = "block";
				}
			});
		}
	});
});

function createHeat(testData) {
	heatmapLayer.remove()
	map.addLayer(heatmapLayer);
	heatmapLayer.setData(testData);
}

var cfg = {
	// radius should be small ONLY if scaleRadius is true (or small radius is intended)
	// if scaleRadius is false it will be the constant radius used in pixels
	"radius": 20,
	"maxOpacity": .8,
	// scales the radius based on map zoom
	"scaleRadius": false,
	// if set to false the heatmap uses the global maximum for colorization
	// if activated: uses the data maximum within the current map boundaries
	//   (there will always be a red spot with useLocalExtremas true)
	"useLocalExtrema": true,
	// which field name in your data represents the latitude - default "lat"
	latField: 'lat',
	// which field name in your data represents the longitude - default "lng"
	lngField: 'lng',
	// which field name in your data represents the data value - default "value"
	valueField: 'count'
};

var heatmapLayer = new HeatmapOverlay(cfg);

map.addLayer(heatmapLayer);


function createHeat(testData) {
	heatmapLayer.remove()
	map.addLayer(heatmapLayer);
	heatmapLayer.setData(testData);
}