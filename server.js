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
const mysql = require('mysql'); 
const util = require('util');
const { type } = require('os');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const port = 3000
const app = express()
app.use(express.static('public'));
app.use(bodyParser.json());
const request = require('request');
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
//app.use(limit('400M'));


const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678"
  });

function query(sql){
    con.query(sql, function (err, result) {
        if (err) throw err;
        return result;
    });
}

query("USE web;")

function createConnection() {
    const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "12345678",
        database: "web"
      });
    return {
      query( sql, args ) {
        return util.promisify( connection.query )
          .call( connection, sql, args );
      },
      close() {
        return util.promisify( connection.end ).call( connection );
      }
    };
  }

app.listen(port, () => console.log(`Listening to ${port}...`));

app.get('/', function(req, res) {
    res.sendFile('logIn.html',{root:"./public/"});  
})

loginData = {
    isAdmin:null
};

app.get('/authorization', function(req, res) 
{
    res.json(loginData);
});

curUserId = 1;
app.post('/login', async function (req, res) {
	let array = req.body

    const connection = createConnection();

	const result = await connection.query("SELECT id,userpass,isAdmin from user where email = '" + array.email + "'");
    
    if(!(typeof result[0] === "undefined")){
        obj = JSON.parse(JSON.stringify(result[0]))
        if (array.password === obj.userpass){
            loginData.isAdmin = obj.isAdmin
            curUserId = obj.id;
        } 
        else{

            res.data = "Wrong email or password"
            res.sendStatus(400);
            return;
        }
    }else{
        res.data = "Wrong email or password"
        res.sendStatus(400);
        return;
    }

    res.sendStatus(200);
});

app.post('/signup',async function (req, res) {
	let array = req.body

    loginData.isAdmin = 0;
    const connection = createConnection();

    const emailResult = await connection.query("SELECT id from user where email = '" + array.email + "'");
    if(typeof emailResult[0] !== "undefined"){
        res.data = "Invalid email!";
        res.sendStatus(400);
        return;
    }

	await connection.query("INSERT INTO User(username,userpass,email,isAdmin) Values('" + array.username + "','"+array.password+"','"+array.email+"','0')");
    
	var result = await connection.query("SELECT id from user where email = '" + array.email + "'");

    obj = JSON.parse(JSON.stringify(result[0]))
    curUserId = obj.id;

	res.sendStatus(200);
});


var jsonFile = null;
var testData = null;
var heat = null;
app.post('/jsonUpload', function (req, res){
	var form = new formidable.IncomingForm();
    
    form.parse(req);

    heat = req.query.heat
    
    form.on('file', async function (name, file){
		let rawdata = fs.readFileSync(file.path);
        jsonFile = JSON.parse(rawdata)
        jsonFile = patraJson(jsonFile)
        if(heat)
        testData = heatMap(jsonFile);
        var d = new Date();
        const connection = createConnection();
        await connection.query("UPDATE user set last_upload = " + d.getTime() + " where id = "+curUserId)
        if(heat)
        res.json(testData);
        else
        res.sendStatus(200);
    });

    
});


app.post('/arrayUpload',function (req, res){	
    let coordinates = req.body
    jsonFile = parseData(jsonFile,coordinates)
    if(heat)
    testData = heatMap(jsonFile);
    jsonFile = null;
    testData = null;
    heat = null;
    res.json(testData);
});

function patraJson(jsonFile){
    let tempjson = {
        "locations":[]
    }
    jsonFile.locations.forEach(function iteration(value){
        var lat = value.latitudeE7*Math.pow(10,-7);
		var lng = value.longitudeE7*Math.pow(10,-7);
        if(getDistanceFromLatLonInKm(lat,lng,38.230462,21.753150)<10)
            tempjson.locations.push(value)
    })
    return tempjson;
}

function parseData(jsonFile,coordinates){
    let tempjson = {
        "locations":[]
    }

	jsonFile.locations.forEach(function iteration(value){
        var skip = false;
		var lat = value.latitudeE7*Math.pow(10,-7);
		var lng = value.longitudeE7*Math.pow(10,-7);
		 
        coordinates.forEach(function(element,i,table){
            var lat_min = element[0].lat;
            var lat_max = element[2].lat;
            var lng_min = element[0].lng;
            var lng_max = element[2].lng;
            if( lat>=lat_min && lat<=lat_max && lng>=lng_min && lng<=lng_max)
                skip = true;
        })
        
        if(!skip){
            tempjson.locations.push(value);
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
        }
    })	
    return tempjson;
}

app.get('/years', async function (req, res){	

    let years = {
        early_year:null,
        late_year:null
    }

    const connection = createConnection();

    const minYearsResult = await connection.query("SELECT MIN(time) from location " + ((loginData.isAdmin===0) ? ("where user_id =" + curUserId) : ""));

    years.early_year = (new Date(JSON.parse(JSON.stringify(minYearsResult[0]))['MIN(time)'])).getFullYear();

    const maxYearsResult = await connection.query("SELECT MAX(time) from location " + ((loginData.isAdmin===0) ? ("where user_id =" + curUserId) : ""));

    years.late_year = (new Date(JSON.parse(JSON.stringify(maxYearsResult[0]))['MAX(time)'])).getFullYear();
	
	res.json(years);
});

app.get('/periodUpload',async function (req, res){	
    
    if(loginData.isAdmin === 1){
        res.sendStatus(403)
        return;
    }


    let sampleData = {
        labels: [],
        weeks : [],
        percentages: [],
        heatmapData: {
            max: 150000,
            data: data = null  
        }
    }

    const firstMonth = req.query.firstMonth;
    const lastMonth = req.query.lastMonth;
    const firstYear = req.query.firstYear;
    const lastYear = req.query.lastYear;

	let array = {
        first_month :firstMonth,
        last_month : typeof lastMonth === 'undefined' ? null : lastMonth,
        first_year :firstYear,
        last_year : typeof lastYear === 'undefined' ? null : lastYear
    }

    const connection = createConnection();

    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','no_data']
    sql = "SELECT activity.time,type,latitude,longitude from activity join location on location_user_id = user_id AND location_time = location.time where location_user_id =" + curUserId
    var result = await connection.query(sql);

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

	res.json(sampleData);
});

app.get('/statUpload', async function (req, res){	
    
    if(loginData.isAdmin === 1){
        res.sendStatus(403)
        return;
    }
    
    let statData = {
        user: null,
        dates : {
            startDate : null,
            endDate : null,
            lastUplaod : null
        },
        position : null,
        score : null,
        percentages : []
    }

    const connection = createConnection();

    const userResult = await connection.query("SELECT username from user where id =" + curUserId);

    statData.user = JSON.parse(JSON.stringify(userResult[0])).username

    const minDateResult = await connection.query("SELECT MIN(time) from location where user_id =" + curUserId);

    statData.dates.startDate = (new Date(JSON.parse(JSON.stringify(minDateResult[0]))['MIN(time)'])).toDateString()

    const lastUploadResult = await connection.query("SELECT last_upload from user where id =" + curUserId);

    statData.dates.lastUplaod = (new Date(JSON.parse(JSON.stringify(lastUploadResult[0]))['last_upload'])).toDateString()

    const maxDateResult = await connection.query("SELECT MAX(time) from location where user_id =" + curUserId);

    statData.dates.endDate = (new Date(JSON.parse(JSON.stringify(maxDateResult[0]))['MAX(time)'])).toDateString()

    const monthEcoResult = await connection.query("SELECT time,type from activity where location_user_id =" + curUserId);

    months = [{green:0,red:0}, 
        {green:0,red:0},{green:0,red:0}, {green:0,red:0}, {green:0,red:0}, {green:0,red:0},
        {green:0,red:0}, {green:0,red:0},{green:0,red:0}, {green:0,red:0}, {green:0,red:0},
        {green:0,red:0}]
    
    greenTypes = ['ON_BICYCLE', 'ON_FOOT', 'RUNNING','WALKING']
    redTypes = ['EXITING_VEHICLE', 'IN_RAIL_VEHICLE', 'IN_ROAD_VEHICLE', 'IN_VEHICLE']
    neutralTypes = ['STILL', 'TILTING', 'UNKNOWN']

    const monthEcoResults = JSON.parse(JSON.stringify(monthEcoResult))
    var d = new Date();
    var curYear = d.getFullYear();
    var curMonth = d.getMonth();

    monthEcoResults.forEach( function iteration(value){
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

    var globalMonthEcoResult = await connection.query("SELECT username,id,time,type from user JOIN activity on id = location_user_id");

    let finScores = []

    const globalMonthEcoResults = JSON.parse(JSON.stringify(globalMonthEcoResult))
    
    if((typeof globalMonthEcoResults[0]) !== 'undefined')
        curId = globalMonthEcoResults[0].id
    tempScores = {green:0,red:0}
    globalMonthEcoResults.forEach( function iteration(value,index,array){
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
            if (!isNaN(percentage))
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
            name: (typeof finScores[0] === 'undefined')?"no_data":finScores[0].name,
            score: (typeof finScores[0] === 'undefined')?"no_data":finScores[0].score
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

	res.json(statData);
});

app.get('/dashboard', async function (req, res){	
    
    if(loginData.isAdmin === 0){
        res.sendStatus(403)
        return;
    }

    let tempDash = {
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

    const connection = createConnection();

    const minTimeResult = await connection.query("SELECT MIN(time) from location");

    let early_year = (new Date(JSON.parse(JSON.stringify(minTimeResult[0]))['MIN(time)'])).getFullYear()

    const maxTimeResult = await connection.query("SELECT MAX(time) from location");

    tempDash.registries.avYears.push()
    for(i=early_year;i<=(new Date(JSON.parse(JSON.stringify(maxTimeResult[0]))['MAX(time)'])).getFullYear();i++){
        tempDash.registries.avYears.push(i)
        tempDash.registries.years.push(0)
    }

    const activityCountResult = await connection.query("SELECT COUNT(*) FROM activity");

    let total = JSON.parse(JSON.stringify(activityCountResult[0]))['COUNT(*)']

    const groupedTypeCountResult = await connection.query("SELECT type,COUNT(*) as occurances FROM activity group by type");

    const groupedTypeCountResults = JSON.parse(JSON.stringify(groupedTypeCountResult))
        
    groupedTypeCountResults.forEach(function iteration(value){
        tempDash.activity.labels.push(value.type)
        tempDash.activity.percentages.push((value.occurances/(total)*100).toFixed(2))
    })

    var groupedUserCountResult = await connection.query("Select user.username, count(*) as count from activity join user on location_user_id = id group by(id)");
    const groupedUserCountResults = JSON.parse(JSON.stringify(groupedUserCountResult))
    
    groupedUserCountResults.forEach(function iteration(value){
        tempDash.userSubs.push({name:value.username,subs:value.count})
    })
    tempDash.userSubs.sort(function(a, b) {
        var keyA = new Date(a.subs),
          keyB = new Date(b.subs);
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });
    

    const timeResult = await connection.query("SELECT time FROM activity");

    const timeResults = JSON.parse(JSON.stringify(timeResult))
        
    timeResults.forEach(function iteration(value){
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

	res.json(tempDash);
});

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

app.post('/mapboard',async function (req, res){	

    if(loginData.isAdmin === 0){
        res.sendStatus(403)
        return;
    }

    let mapPeriodData = req.body
    
    let tempMap = {
            max: 15000,
            data: []  
    }
    
    const connection = createConnection();
    
    if(mapPeriodData.all.year){
        const minDateResult = await connection.query("SELECT MIN(time) from location");

        mapPeriodData.years.first_year = (new Date(JSON.parse(JSON.stringify(minDateResult[0]))['MIN(time)'])).getFullYear()

        const maxDateResult = await connection.query("SELECT MAX(time) from location");

        mapPeriodData.years.last_year = (new Date(JSON.parse(JSON.stringify(maxDateResult[0]))['MAX(time)'])).getFullYear()
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
    
    const result = await connection.query("SELECT activity.time,type,latitude,longitude from activity join location on location_user_id = user_id AND location_time = location.time");

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

    res.json(tempMap);
});



app.post('/export',async function (req, res){	

    if(loginData.isAdmin === 0){
        res.sendStatus(403)
        return;
    }

    let mapPeriodData = req.body.data;
    let type = req.body.type;

    const connection = createConnection();
    
    if(mapPeriodData.all.year){
        const minDateResult = await connection.query("SELECT MIN(time) from location");

        mapPeriodData.years.first_year = (new Date(JSON.parse(JSON.stringify(minDateResult[0]))['MIN(time)'])).getFullYear()

        const maxDateResult = await connection.query("SELECT MAX(time) from location");

        mapPeriodData.years.last_year = (new Date(JSON.parse(JSON.stringify(maxDateResult[0]))['MAX(time)'])).getFullYear()
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

    if(type === "JSON"){
        jsonExportTemp = {"locations":[]};
        const result = await connection.query("SELECT location_time,activity.time,type,latitude,longitude,location_user_id from activity join location on location_user_id = user_id AND location_time = location.time");

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
        
        await writeFile('./files/tempFile.json', JSON.stringify(jsonExportTemp))
        
    }
    else if(type === "XML"){
        const result = await connection.query("SELECT location_time,activity.time,type,latitude,longitude,location_user_id from activity join location on location_user_id = user_id AND location_time = location.time");

        results = JSON.parse(JSON.stringify(result))
        let xmlTempFile = "<locations>";
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
        await writeFile('./files/tempFile.xml', xmlTempFile)
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

        const result = await connection.query("SELECT location_time,activity.time,type,latitude,longitude,location_user_id from activity join location on location_user_id = user_id AND location_time = location.time");

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
        await csvWriter.writeRecords(csvExportTemp)
    }
    
    if (type === 'JSON'){
        res.download('./files/tempFile.json');
    }
    if (type === 'CSV'){
        res.download('./files/tempFile.csv');
    }
    if (type === 'XML'){
        res.download('./files/tempFile.xml');
    }
})


app.delete('/deleteBase', async function (req, res){	

    if(loginData.isAdmin === 0){
        res.sendStatus(403)
        return;
    }

    const connection = createConnection();
    await connection.query("SET FOREIGN_KEY_CHECKS=0")
    await connection.query("TRUNCATE TABLE location")
    await connection.query("TRUNCATE TABLE activity")
    await connection.query("SET FOREIGN_KEY_CHECKS=1");

    res.sendStatus(200);
})


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

