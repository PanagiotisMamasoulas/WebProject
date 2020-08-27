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
const { type } = require('os');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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

var curUserId = "3"
app.post('/arrayUpload', function (req, res){	
    let array = req.body
    parseData(jsonFile,array)
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

years0 = {
    early_year:null,
    late_year:null
}
app.post('/getYears0', function (req, res){	

	sql = "SELECT MIN(time) from location"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MIN(time)'])

        years0.early_year = date.getFullYear()
        
    });

    sql = "SELECT MAX(time) from location"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MAX(time)'])

        years0.late_year = date.getFullYear()
    });
	
	res.sendStatus(200);
});

app.get('/downloadYears0', (req, res) => {
    res.json(years0);
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
	position : null,
	score : null,
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
        var curYear = d.getFullYear();
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

    sql = "SELECT username,id,time,type from user JOIN activity on id = location_user_id"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        greenTypes = ['ON_BICYCLE', 'ON_FOOT', 'RUNNING','WALKING']
        redTypes = ['EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE']
        neutralTypes = ['STILL', 'TILTING', 'UNKNOWN']
        var d = new Date();
        var curMonth = d.getMonth();
        var curYear = d.getFullYear();

        finScores = []

        results = JSON.parse(JSON.stringify(result))

        curId = results[0].id
        tempScores = {green:0,red:0}
        results.forEach( function iteration(value,index,array){
            if(curId !== value.id || ((typeof array[index+1]) === 'undefined')){
                curId = value.id
                if((typeof array[index+1]) === 'undefined'){
                    date = new Date(value.time)
                    month = date.getMonth()
                    year = date.getFullYear()
            
                    if(year === curYear && month === curMonth){
                        if(greenTypes.includes(value.type))
                            tempScores.green++;
                        if(redTypes.includes(value.type))
                            tempScores.red++;
                    }
                }
                percentage = ((tempScores.green/(tempScores.green+tempScores.red))*100).toFixed(2);
                finScores.push({name:array[index-1].username,score:percentage,id:array[index-1].id})
                tempScores = {green:0,red:0}
            }
            else{
                date = new Date(value.time)
                month = date.getMonth()
                year = date.getFullYear()
            
                if(year === curYear && month === curMonth){
                    if(greenTypes.includes(value.type))
                        tempScores.green++;
                    if(redTypes.includes(value.type))
                        tempScores.red++;
                }
            }    
        })

        finScores.sort(function(a, b) {
            var keyA = new Date(a.score),
              keyB = new Date(b.score);
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });

        statData.position = finScores.findIndex(function(person) {
                return person.id == curUserId
          }) + 1;
        statData.score = {
            first : {
                name: finScores[0].name,
                score: finScores[0].score
            },
            second : {
                name: (typeof finScores[1] === 'undefined')?"no_data":finScores[1].name,
                score: (typeof finScores[1] === 'undefined')?"no_data":finScores[1].score
            },
            third : {
                name: (typeof finScores[2] === 'undefined')?"no_data":finScores[2].name,
                score: (typeof finScores[2] === 'undefined')?"no_data":finScores[2].score
            }
        }
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
            percentages:[],
            labels:[]
        },
    
        userSubs : [],
    
        registries : {
            month : [0,0,0,0,0,0,0,0,0,0,0,0],
            days: [0,0,0,0,0,0,0],
            hour: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            avYears:[],
            years:[]
        }
    
    }

    early_year = null;
    sql = "SELECT MIN(time) from location"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MIN(time)'])

        early_year = date.getFullYear()
        
    });

    sql = "SELECT MAX(time) from location"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        date = new Date(JSON.parse(JSON.stringify(result[0]))['MAX(time)'])

        
        tempDash.registries.avYears.push()
        for(i=early_year;i<=date.getFullYear();i++){
            tempDash.registries.avYears.push(i)
            tempDash.registries.years.push(0)
        }
    });

    total = null;
    sql = "SELECT COUNT(*) FROM activity"
    con.query(sql, function (err, result) {
        if (err) throw err;
        total = JSON.parse(JSON.stringify(result[0]))['COUNT(*)']
    });

    sql = "SELECT type,COUNT(*) as occurances FROM activity group by type"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        results = JSON.parse(JSON.stringify(result))
        
        results.forEach(function iteration(value){
            tempDash.activity.labels.push(value.type)
            tempDash.activity.percentages.push((value.occurances/(total)*100).toFixed(2))
        })
    });

    sql = "Select user.username, count(*) as count from activity join user on location_user_id = id group by(id)"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        results = JSON.parse(JSON.stringify(result))
        
        results.forEach(function iteration(value){
            tempDash.userSubs.push({name:value.username,subs:value.count})
        })

    });
    tempDash.userSubs.sort((a,b) => (a.subs > b.subs) ? 1 : ((b.subs > a.subs) ? -1 : 0))

    sql = "SELECT time FROM activity"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        results = JSON.parse(JSON.stringify(result))
        
        results.forEach(function iteration(value){
            date = new Date(value.time)
            month = date.getMonth();
            day = date.getDay();
            hour = date.getHours();
            year = date.getFullYear();

            tempDash.registries.month[month]++
            tempDash.registries.days[day]++
            tempDash.registries.hour[hour]++
            tempDash.registries.years[tempDash.registries.avYears.indexOf(year)]++
        })
        tempDash.registries.days.push(tempDash.registries.days.shift())
    });

    dashData = tempDash;
	res.sendStatus(200);
});

app.get('/downloadDashData', (req, res) => {
    res.json(dashData);
})

function fixMapPeriodData(mapPeriodData){
    if(mapPeriodData.all.year){
        sql = "SELECT MIN(time) from location"
        con.query(sql, function (err, result) {
            if (err) throw err;
            
            date = new Date(JSON.parse(JSON.stringify(result[0]))['MIN(time)'])

            mapPeriodData.years.first_year = date.getFullYear()
            
        });

        sql = "SELECT MAX(time) from location"
        con.query(sql, function (err, result) {
            if (err) throw err;
            
            date = new Date(JSON.parse(JSON.stringify(result[0]))['MAX(time)'])

            mapPeriodData.years.last_year = date.getFullYear()
        });
    }
    else if(mapPeriodData.years.last_year === null)
        mapPeriodData.years.last_year=mapPeriodData.years.first_year;
    if(mapPeriodData.all.month){
        mapPeriodData.months.first_month = 0
        mapPeriodData.months.last_month = 11
    }
    else if(mapPeriodData.months.last_month===null)
        mapPeriodData.months.last_month = mapPeriodData.months.first_month
    if(mapPeriodData.all.day){
        mapPeriodData.days.first_day = 0
        mapPeriodData.days.last_day = 6
    }
    else if(mapPeriodData.days.last_day===null)
        mapPeriodData.days.last_day = mapPeriodData.days.first_day
    if(mapPeriodData.all.hour){
        mapPeriodData.hours.first_hour = 0
        mapPeriodData.hours.last_hour = 23
        mapPeriodData.hours.first_mins = 0
        mapPeriodData.hours.last_mins = 59
    }
    else if(mapPeriodData.hours.last_hour === null){
        mapPeriodData.hours.last_hour = mapPeriodData.hours.first_hour
        mapPeriodData.hours.last_mins = mapPeriodData.hours.first_mins
    }
    if(mapPeriodData.all.activity){
        mapPeriodData.activities = ['EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'ON_BICYCLE', 'RUNNING', 'STILL', 'TILTING', 'UNKNOWN', 'WALKING']
    }
    return mapPeriodData;
}
function isInside(mapPeriodData,value){
    if(mapPeriodData.activities.includes(value.type)){
        var date = new Date(value.time);
        year = date.getFullYear()
        if(year>=mapPeriodData.years.first_year&&year<=mapPeriodData.years.last_year){
            month = date.getMonth()
            if(month>=mapPeriodData.months.first_month&&month<=mapPeriodData.months.last_month){
                day = date.getDay()
                if(day>=mapPeriodData.days.first_day&&day<=mapPeriodData.days.last_day){
                    hour = date.getHours()
                    if(hour>=mapPeriodData.hours.first_hour&&hour<=mapPeriodData.hours.last_hour){
                        mins = date.getMinutes()
                        if(mins>=mapPeriodData.hours.first_mins&&mins<=mapPeriodData.hours.last_mins){
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

mapData = null;
app.post('/mapUpload', function (req, res){	
    let mapPeriodData = req.body
    
    tempMap = {
            max: 15000,
            data: []  
    }
    
    fixMapPeriodData(mapPeriodData);
    
    sql = "SELECT activity.time,type,latitude,longitude from activity join location on location_user_id = user_id AND location_time = location.time"
    con.query(sql, function (err, result) {
        if (err) throw err;
        
        results = JSON.parse(JSON.stringify(result))

        results.forEach(function iteration(value){

            if(isInside(mapPeriodData,value)){                 
                var lat = value.latitude*Math.pow(10,-7);
                var lng = value.longitude*Math.pow(10,-7);
                var elem = { lat:lat, lng:lng, count: 1};
                var found = false;
                found = tempMap.data.some(function iteration(val,ind,arr){
                    if(val.lat === lat && val.lng === lng){
                        val.count += 1;
                        return true;
                    } 
                })
                if(!found)
                    tempMap.data.push(elem)
                                
            }
        })
    })

    mapData = tempMap
	res.sendStatus(200);
});

app.get('/downloadmapData', (req, res) => {
    res.json(mapData);
})

typeExport = null;
app.post('/exportUpload', function (req, res){	
    let mapPeriodData = req.body.data
    let type = req.body.type

    mapPeriodData = fixMapPeriodData(mapPeriodData);
    if(type === "JSON"){
        jsonExportTemp = {"locations":[]};
        sql = "SELECT location_time,activity.time,type,latitude,longitude,location_user_id from activity join location on location_user_id = user_id AND location_time = location.time"
        con.query(sql, function (err, result) {
            if (err) throw err;
            
            results = JSON.parse(JSON.stringify(result))

            results.forEach(function iteration(value){

                if(isInside(mapPeriodData,value)){                 
                   jsonExportTemp.locations.push({
                    "timestampMs" : value.location_time,
                    "latitudeE7" : value.latitude,
                    "longitudeE7" : value.longitude,
                    "UserId": value.location_user_id, 
                    "activity" : [ {
                      "timestampMs" : value.time,
                      "activity" : [ {
                        "type" : value.type,
                      } ]
                    } ]
                  })             
                }
            })
            fs.writeFileSync('./files/tempFile.json', JSON.stringify(jsonExportTemp))
        })
    }
    else if(type === "XML"){
        xmlTempFile = "<locations>\n"
        sql = "SELECT location_time,activity.time,type,latitude,longitude from activity join location on location_user_id = user_id AND location_time = location.time"
        con.query(sql, function (err, result) {
            if (err) throw err;
            
            results = JSON.parse(JSON.stringify(result))

            results.forEach(function iteration(value){

                if(isInside(mapPeriodData,value)){                 
                    xmlTempFile = xmlTempFile.concat("<location>\n")
                    xmlTempFile = xmlTempFile.concat("<time>"+value.location_time+"</time>\n")
                    xmlTempFile = xmlTempFile.concat("<latitude>"+value.latitude+"</latitude>\n")
                    xmlTempFile = xmlTempFile.concat("<longitude>"+value.longitude+"</longitude>\n")
                    xmlTempFile = xmlTempFile.concat("<activity_time>"+value.time+"</activity_time>\n")
                    xmlTempFile = xmlTempFile.concat("<activity_type>"+value.type+"</activity_type>\n")
                    xmlTempFile = xmlTempFile.concat("<user_id>"+value.location_user_id+"</user_id>\n")                    
                    xmlTempFile = xmlTempFile.concat("</location>\n")
                }
            })
            xmlTempFile = xmlTempFile.concat("</locations>")
            fs.writeFileSync('./files/tempFile.xml', xmlTempFile)
        })
    }
    else if(type === "CSV"){
        const csvWriter = createCsvWriter({
            path: './files/tempFile.csv',
            header: [
              {id: 'location_time', title: 'Time'},
              {id: 'latitudeE7', title: 'Latitude'},
              {id: 'longitudeE7', title: 'Longitude'},
              {id: 'activity_type', title: 'Type'},
              {id: 'activity_time', title: 'Activity Time'},
              {id: 'user_id', title: 'User Id'},
            ]
          });
        csvExportTemp = []
        sql = "SELECT location_time,activity.time,type,latitude,longitude,location_user_id from activity join location on location_user_id = user_id AND location_time = location.time"
        con.query(sql, function (err, result) {
            if (err) throw err;
            
            results = JSON.parse(JSON.stringify(result))

            results.forEach(function iteration(value){

                if(isInside(mapPeriodData,value)){                 
                    csvExportTemp.push({
                        location_time: value.location_time,
                        latitudeE7 : value.latitude,
                        longitudeE7 : value.longitude,
                        activity_type: value.type,
                        activity_time: value.time,
                        user_id: value.location_user_id 
                    })            
                }
            })
            csvWriter.writeRecords(csvExportTemp)
        })
    }

    typeExport = type;
    res.sendStatus(200);
})

app.get('/downloadExport', (req, res) => {
    if (typeExport === 'JSON'){
        res.download('./files/tempFile.json');
    }
    if (typeExport === 'CSV'){
        res.download('./files/tempFile.csv');
    }
    if (typeExport === 'XML'){
        res.download('./files/tempFile.xml');
    }
})

app.post('/deleteBase', function (req, res){	
    sql = "DELETE from location"
    con.query(sql, function (err, result) {})
    sql = "DELETE from activity"
    con.query(sql, function (err, result) {})

    res.sendStatus(200);
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
                    insActivity = curActivity.activity[0].type
                    if(curActivity.activity[0].type === "ON_FOOT" || curActivity.activity[0].type === "IN_VEHICLE"){
                        child_activities = ['IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE','RUNNING','WALKING']
                        curActivity.activity.forEach(function it(conActivity){
                            if(child_activities.includes(conActivity.type)){
                                insActivity = conActivity.type
                                return;
                            }      
                        })
                    }        
                    query("INSERT INTO activity VALUES ("+curUserId+","+value.timestampMs+","+curActivity.timestampMs+",'"+insActivity+"')");
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

