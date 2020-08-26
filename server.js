const http = require('http')
const fs = require('fs')
const express = require('express')
var router = express.Router();
const path   = require("path");
const multer = require("multer");
const formidable = require("formidable")
const { title } = require('process')
var bodyParser = require('body-parser');
const { json } = require('body-parser');
var mysql = require('mysql'); 
const port = 3000
const app = express()
app.use(express.static('public'));
app.use(bodyParser.json());

var con = mysql.createConnection({
    host: "DESKTOP-EGIOGHS",
    user: "node",
    password: "toor"
  });
function query(sql){
    con.query(sql, function (err, result) {
        if (err) throw err;
        return result;
    });
}

query("USE web;")

function toDate(number){
    var date = new Date(number * 1000);
    return date
}

app.get('/', function(req, res, next) {
	res.sendFile('intro.html');
})

app.listen(port, () => console.log(`Listening to ${port}...`));

var jsonFile = null;
var testData = null;
var userId = 1;
app.post('/jsonUpload', function (req, res){
	var form = new formidable.IncomingForm();
		
    form.parse(req);
	
    form.on('file', function (name, file){
		let rawdata = fs.readFileSync(file.path);
		jsonFile = JSON.parse(rawdata)
		//testData = heatMap(jsonFile)
    });

    res.sendStatus(200);
});

app.get('/download', (req, res) => {
    res.json(testData);
})

var curUserId = "4"
app.post('/arrayUpload', function (req, res){	
    let array = req.body
    console.log(jsonFile)
    //parseData(jsonFile,array)
	res.sendStatus(200);
});

years = {
    early_year:null,
    late_year:null
}
app.post('/getYears', function (req, res){	

	sql = "SELECT MIN(time) from location where user_id =" + curUserId
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MIN(time)'])

        years.early_year = date.getFullYear()
        
    });

    sql = "SELECT MAX(time) from location where user_id =" + curUserId
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MAX(time)'])

        years.late_year = date.getFullYear()
    });
	
	res.sendStatus(200);
});

app.get('/downloadYears', (req, res) => {
    res.json(years);
})

periodData = null;
app.post('/periodUpload', function (req, res){	

    sampleData = {
        labels: [],
        weeks : [],
        percentages: [],
        heatmapData: {
            max: 150000,
            data: data = null  
        }
    }
	let array = req.body
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','no_data']
    sql = "SELECT activity.time,type,latitude,longitude from activity join location on location_user_id = user_id AND location_time = location.time where location_user_id =" + curUserId
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        results = JSON.parse(JSON.stringify(result))
        data = []
        tempData = []
        activityCount = 0;
        results.forEach(function iteration(value){
            date = new Date(value.time)
            activity_year = date.getFullYear()
            activity_month = date.getMonth()
            inside = null;
            if(array.last_month === null){
                inside = (activity_year === Number(array.first_year) && activity_month === Number(array.first_month))
            }else{
                inside = (activity_year >= Number(array.first_year) && activity_year <= Number(array.last_year) 
                && activity_month >= Number(array.first_month)&& activity_month >= Number(array.last_month))
            }

                if(inside){
                    //heatmap
                    activityCount++;
                    var lat = value.latitude*Math.pow(10,-7);
                    var lng = value.longitude*Math.pow(10,-7);
                    var elem = { lat:lat, lng:lng, count: 1};
                    var found = false;
                    found = data.some(function iteration(val,ind,arr){
                        if(val.lat === lat && val.lng === lng){
                            val.count += 1;
                            return true;
                        } 
                    })
                    if(!found)
                        data.push(elem)

                    found = false;
                    tempData.forEach(function iter(val){
                        if(val.type === value.type){
                            val.count++;
                            val.days[date.getDay()]++
                            val.hours[date.getHours()]++
                            found = true;
                            return;
                        }
                    })
                    if(!found){
                        tempData.push({
                            type:value.type,
                            count:0,
                            days: [0,0,0,0,0,0,0],
                            hours: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                        })
                        tempData[tempData.length - 1].count++;
                        tempData[tempData.length - 1].days[date.getDay()]++
                        tempData[tempData.length - 1].hours[date.getHours()]++
                    }
                    
                } 
            
        })

    
        sampleData.heatmapData.data = data;

        tempData.forEach(function iter(val){
            sampleData.labels.push(val.type)
            percentage = (val.count/(activityCount)*100).toFixed(2)
            sampleData.percentages.push(percentage)
            top = 8;
            max = 0;
            val.days.forEach(function iter(val,index){
                if(val>max)
                    top = index;
            })
            day = days[top]
            top = 'no_data';
            max = 0;
            val.hours.forEach(function iter(val,index){
                if(val>max)
                    top = index;
            })
            hour = top+":00"
            sampleData.weeks.push({
                hour: hour,
                day: day
            })
        })

    });
    periodData = sampleData;    
    
	res.sendStatus(200);
});

app.get('/downloadPeriodData', (req, res) => {
    res.json(periodData);
})

statData = {
	user: null,
	dates : {
		startDate : null,
		endDate : null,
		lastUplaod : new Date(2020, 7, 10)
	},
	position : 46,
	score : {
		first : {
			name: "Marika L.",
			score: 92
		},
		second : {
			name: "Leopold II.",
			score: 87
		},
		third : {
			name: "Kanellis G.",
			score: 85
		}
	},
	percentages : []
}

app.post('/statUpload', function (req, res){	
	//φτιαξε statdata
    
    sql = "SELECT username from user where id =" + curUserId
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        statData.user = JSON.parse(JSON.stringify(result[0])).username
        
    });

    sql = "SELECT MIN(time) from location where user_id =" + curUserId
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MIN(time)'])

        statData.dates.startDate = date.toDateString()
        
    });

    sql = "SELECT MAX(time) from location where user_id =" + curUserId
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MAX(time)'])

        statData.dates.endDate = date.toDateString()
    });

    sql = "SELECT time,type from activity where location_user_id =" + curUserId
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        months = [{green:0,red:0}, 
            {green:0,red:0},{green:0,red:0}, {green:0,red:0}, {green:0,red:0}, {green:0,red:0},
            {green:0,red:0}, {green:0,red:0},{green:0,red:0}, {green:0,red:0}, {green:0,red:0},
            {green:0,red:0}]
        
        greenTypes = ['ON_BICYCLE', 'ON_FOOT', 'RUNNING','WALKING']
        redTypes = ['EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE']
        neutralTypes = ['STILL', 'TILTING', 'UNKNOWN']

        results = JSON.parse(JSON.stringify(result))
        var d = new Date();
        var curYear = 2019//d.getFullYear();
        var curMonth = d.getMonth();

        results.forEach( function iteration(value){
            date = new Date(value.time)
            month = date.getMonth()
            year = date.getFullYear()
            if(month <= curMonth){
                if (year === curYear){
                    if(greenTypes.includes(value.type))
                        months[month].green++;
                    if(redTypes.includes(value.type))
                        months[month].red++;
                }
            }else{
                if (year === curYear-1){
                    if(greenTypes.includes(value.type))
                        months[month].green++;
                    if(redTypes.includes(value.type))
                        months[month].red++;
                }
            }
        })
        months.forEach(function iterate(value){
            percentage = ((value.green/(value.green+value.red))*100).toFixed(2);
            if(percentage === 'NaN') percentage = 0;
            statData.percentages.push(percentage)
        }) 
    });

    sql = "SELECT location_user_id,username,time,type from activity join user on location_user_id = user.id;"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        var d = new Date();
        var cur_month = d.getMonth();
        var cur_year = 2015//d.getFullYear();
        results = JSON.parse(JSON.stringify(result))

        greenTypes = ['ON_BICYCLE', 'ON_FOOT', 'RUNNING','WALKING']
        redTypes = ['EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE']
        neutralTypes = ['STILL', 'TILTING', 'UNKNOWN']

        scores = []

        results.forEach( function iteration(value){
            date = new Date(value.time)
            month = date.getMonth()
            year = date.getFullYear()
            if(month === cur_month && year === cur_year){
                found = false;
                scores.forEach(function iter(val){
                    if(val.id === value.user_id){
                        if(greenTypes.includes(value.type))
                            val.green++;
                        if(redTypes.includes(value.type))
                            val.red++;
                        found = true;
                        return;
                    }
                })
                if(!found){
                    if(greenTypes.includes(value.type))
                        scores.push({id:value.location_user_id,green:1,red:0,name:value.username})
                    else if(redTypes.includes(value.type))
                        scores.push({id:value.location_user_id,green:0,red:1,name:value.username})
                    else 
                        scores.push({id:value.location_user_id,green:0,red:0,name:value.username})
                }
            }
        })



        fin_scores = []
        scores.forEach( function iteration(value){
              fin_scores.push({name:value.username,score:((value.green/(value.green+value.red))*100).toFixed(2)})     
        })

        
        fin_scores.sort(function(a, b) {
            var keyA = a.score,
            keyB = b.score;
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });

    });
	res.sendStatus(200);
});

app.get('/downloadStatData', (req, res) => {
    res.json(statData);
})

dashData = null
app.post('/dashUpload', function (req, res){	
    
    tempDash = {
        activity : {
            percentages:[22,45,17,16],
            labels:["On_Foot","On_Vehicle","Still","Tilting"]
        },
    
        userSubs : [
            {name:"Ioanna",subs:2341234},       
        ],
    
        registries : {
            month : [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            days: [0,0,0,0,0,0,0],
            hour: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            avYears:[],
            years:[3567890,2545643]
        }
    
    }

    //avYears
    sql = "SELECT MIN(time) from location"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MIN(time)'])

        tempDash.registries.push(date.getFullYear())
        
    });

    sql = "SELECT MAX(time) from location"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MAX(time)'])

        tempDash.registries.push(date.getFullYear())
    });

    

    
    dashData = tempDash
	res.sendStatus(200);
});

app.get('/downloadDashData', (req, res) => {
    res.json(dashData);
})

mapData = null;
app.post('/mapUpload', function (req, res){	
    let mapPeriodData = req.body
    mapData = {
            max: 15000,
            data: data = [
                { lat: 38.2891471, lng: 21.7842876, count: 87 },
                { lat: 38.292879299999996, lng: 21.7852864, count: 73 },
                { lat: 38.2985032, lng: 21.7882902, count: 185 },
                { lat: 38.2895204, lng: 21.783992599999998, count: 30 },
                { lat: 38.3007907, lng: 21.7876673, count: 26 },
                { lat: 38.3076412, lng: 21.809057799999998, count: 4 },
                { lat: 38.293552, lng: 21.7915048, count: 7 },
                { lat: 38.296835, lng: 21.7864769, count: 1 },
                { lat: 38.292013499999996, lng: 21.7834254, count: 11 },
                { lat: 38.292221399999995, lng: 21.782398, count: 3 },
                { lat: 38.2779035, lng: 21.7625055, count: 5 },
                { lat: 38.2642853, lng: 21.7438888, count: 1 },
                { lat: 38.2574919, lng: 21.7412794, count: 7 },
                { lat: 38.252228699999996, lng: 21.7395212, count: 1 },
                { lat: 38.2506504, lng: 21.7384427, count: 1 },
                { lat: 38.2472297, lng: 21.737024299999998, count: 1 },
                { lat: 38.2474938, lng: 21.7362857, count: 6 },
                { lat: 38.2440832, lng: 21.7326275, count: 4 },
                { lat: 38.2396233, lng: 21.7285033, count: 1 },
                { lat: 38.239435, lng: 21.72863, count: 1 },
                { lat: 38.239401699999995, lng: 21.7286267, count: 2 },
                { lat: 38.2396283, lng: 21.7292433, count: 1 },
                { lat: 38.239554999999996, lng: 21.7294567, count: 1 },
                { lat: 38.2394433, lng: 21.729606699999998, count: 1 },
                { lat: 38.2392883, lng: 21.72977, count: 1 },
                { lat: 38.23938, lng: 21.72987, count: 1 },
                { lat: 38.239373799999996, lng: 21.7299206, count: 1 },
                { lat: 38.239354999999996, lng: 21.7305133, count: 1 },
                { lat: 38.239405, lng: 21.730601699999998, count: 1 },
                { lat: 38.2397284, lng: 21.7308289, count: 1 },
                { lat: 38.23992, lng: 21.73099, count: 1 },
                { lat: 38.2400983, lng: 21.731019999999997, count: 1 },
                { lat: 38.2402833, lng: 21.7312217, count: 1 },
                { lat: 38.2404833, lng: 21.7311733, count: 1 },
                { lat: 38.2406617, lng: 21.7311867, count: 1 },
                { lat: 38.240836699999996, lng: 21.7311533, count: 1 },
                { lat: 38.2410317, lng: 21.7309317, count: 1 },
                { lat: 38.241126699999995, lng: 21.7305933, count: 1 },
                { lat: 38.2413283, lng: 21.730478299999998, count: 1 },
                { lat: 38.241505, lng: 21.730294999999998, count: 1 },
                { lat: 38.241385, lng: 21.7295767, count: 1 },
                { lat: 38.241833299999996, lng: 21.7301333, count: 1 },
                { lat: 38.241943299999996, lng: 21.7301833, count: 1 },
                { lat: 38.2419575, lng: 21.7301768, count: 1 },
                { lat: 38.2419644, lng: 21.730175499999998, count: 1 },
                { lat: 38.2416109, lng: 21.7297343, count: 1 },
                { lat: 38.2406606, lng: 21.7287561, count: 1 },
                { lat: 38.240246899999995, lng: 21.7292685, count: 1 },
                { lat: 38.2400587, lng: 21.7300371, count: 1 },
                { lat: 38.2394821, lng: 21.730933699999998, count: 1 },
                { lat: 38.2390103, lng: 21.730782299999998, count: 1 },
                { lat: 38.2391824, lng: 21.730502899999998, count: 15 },
                { lat: 38.239016299999996, lng: 21.730700799999997, count: 5 },
                { lat: 38.2391869, lng: 21.7304796, count: 4 },
                { lat: 38.2390435, lng: 21.7307125, count: 1 },
                { lat: 38.2391703, lng: 21.730514499999998, count: 2 },
                { lat: 38.239014, lng: 21.730704799999998, count: 1 },
                { lat: 38.2390239, lng: 21.7307125, count: 1 },
                { lat: 38.2390557, lng: 21.730852199999998, count: 1 },
                { lat: 38.2394683, lng: 21.729128799999998, count: 1 },
                { lat: 38.2396501, lng: 21.7279876, count: 1 },
                { lat: 38.2398479, lng: 21.727778, count: 1 },
                { lat: 38.2399507, lng: 21.7277547, count: 1 },
                { lat: 38.2396697, lng: 21.7279876, count: 1 },
                { lat: 38.239867499999995, lng: 21.727778, count: 1 },
                { lat: 38.239998299999996, lng: 21.7270382, count: 2 },
                { lat: 38.2396153, lng: 21.7280353, count: 1 },
                { lat: 38.270652, lng: 21.7469452, count: 1 },
                { lat: 38.2700441, lng: 21.748459, count: 1 },
                { lat: 38.2700909, lng: 21.748470599999997, count: 13 },
                { lat: 38.270103, lng: 21.748459, count: 1 },
                { lat: 38.2700834, lng: 21.748459, count: 1 },
                { lat: 38.2700789, lng: 21.7484823, count: 1 },
                { lat: 38.269144399999995, lng: 21.747810899999998, count: 1 },
                { lat: 38.2698722, lng: 21.7491187, count: 13 },
                { lat: 38.2698597, lng: 21.748296, count: 1 },
                { lat: 38.2700879, lng: 21.748435699999998, count: 1 },
                { lat: 38.270048599999996, lng: 21.748435699999998, count: 1 },
                { lat: 38.2700921, lng: 21.7484456, count: 1 },
                { lat: 38.270083799999995, lng: 21.748435399999998, count: 1 },
                { lat: 38.2700769, lng: 21.7484239, count: 1 },
                { lat: 38.270076499999995, lng: 21.7484233, count: 1 },
                { lat: 38.2700768, lng: 21.748424, count: 2 },
                { lat: 38.270078, lng: 21.7484462, count: 1 },
                { lat: 38.2700938, lng: 21.7484476, count: 1 },
                { lat: 38.270074699999995, lng: 21.748435, count: 1 },
                { lat: 38.2700775, lng: 21.7484371, count: 1 },
                { lat: 38.270075, lng: 21.7484206, count: 2 },
                { lat: 38.2700873, lng: 21.748455399999997, count: 1 },
                { lat: 38.2700819, lng: 21.748441099999997, count: 1 },
                { lat: 38.2700909, lng: 21.748470299999997, count: 1 },
                { lat: 38.2700883, lng: 21.7485006, count: 1 },
                { lat: 38.270088799999996, lng: 21.7484873, count: 1 },
                { lat: 38.270088799999996, lng: 21.7484871, count: 1 },
                { lat: 38.2700891, lng: 21.7484888, count: 1 },
                { lat: 38.2700895, lng: 21.748490399999998, count: 1 },
                { lat: 38.2700843, lng: 21.7484651, count: 1 },
                { lat: 38.270088799999996, lng: 21.7484866, count: 2 },
                { lat: 38.2700847, lng: 21.748442999999998, count: 1 },
                { lat: 38.2700846, lng: 21.7484428, count: 5 },

        ]  
    }

    //calculate mapData
	res.sendStatus(200);
});

app.get('/downloadmapData', (req, res) => {
    res.json(mapData);
})

//Works but O(n^2)
function parseData(jsonFile,coordinates){
	jsonFile.locations.forEach(function iteration(value, index, array){
        var skip = false;
		var lat = value.latitudeE7*Math.pow(10,-7);
		var lng = value.longitudeE7*Math.pow(10,-7);
		 if(getDistanceFromLatLonInKm(lat,lng,38.230462,21.753150)>10){
			skip = true;
		 }else{
			coordinates.forEach(function(element,i,table){
				var lat_min = element[0].lat;
				var lat_max = element[2].lat;
				var lng_min = element[0].lng;
				var lng_max = element[2].lng;
				if( lat>=lat_min && lat<=lat_max && lng>=lng_min && lng<=lng_max)
					skip = true;
			})
        }
        if(!skip){
            query("INSERT INTO location VALUES ("+curUserId+","+value.timestampMs+","+value.latitudeE7+","+value.longitudeE7+")");
            if (value.hasOwnProperty("activity")){
                value.activity.forEach(function iter(curActivity){
                    var i = 0;
                    if(curActivity.activity[0].type === "ON_FOOT" || curActivity.activity[0].type === "IN_VEHICLE")
                        i = 1;
                    query("INSERT INTO activity VALUES ("+curUserId+","+value.timestampMs+","+curActivity.timestampMs+",'"+curActivity.activity[i].type+"')");
                })
            }
        }else{
            // testData.data.forEach(function iteration(val,ind){
            //     if(val.lat === value.latitudeE7*Math.pow(10,-7) && val.lng === value.longitudeE7*Math.pow(10,-7)){
            //         testData.data.splice(ind,1)  
            //         return
            //     }
            // })    
        }
	})	
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
	  Math.sin(dLat/2) * Math.sin(dLat/2) +
	  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	  Math.sin(dLon/2) * Math.sin(dLon/2)
	  ; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
  }
  
function deg2rad(deg) {
	return deg * (Math.PI/180)
}

function heatMap(jsonFile){
	var data = [];
    jsonFile.locations.forEach(function iteration(value, index, array){
        var lat = value.latitudeE7*Math.pow(10,-7);
        var lng = value.longitudeE7*Math.pow(10,-7);
        var elem = { lat:lat, lng:lng, count: 1};
        var found = false;
        found = data.some(function iteration(val,ind,arr){
            if(val.lat === lat && val.lng === lng){
                val.count += 1;
                return true;
            } 
        })
        if(!found)
            data.push(elem)
    })
    
    tData = {
        max: data.length,
        data: data
	};
	
	return tData
}

