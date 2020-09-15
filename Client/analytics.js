var early_year = 2017;
    var late_year = 2018; //add to nodejs logic

    for(i=early_year;i<=late_year;i++){
        option = document.createElement('option');
        option.value = i.toString();
        option.appendChild(document.createTextNode(i));
        document.getElementById("first_year").appendChild(option);
        option = document.createElement('option');
        option.value = i.toString();
        option.appendChild(document.createTextNode(i));
        document.getElementById("last_year").appendChild(option);
    }

    document.getElementById("check").checked = false

    function handleClick(cb) {
        if(cb.checked){
            document.getElementById("periodDiv").style.display = "block"
        }else{
            document.getElementById("periodDiv").style.display = "none"

        }
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }   

    labels = []
    data = []
    colors = []
    weeks = {
        "Walking" : {
            hour:"16:12",
            day:"Tuesday"
        },
        "Running" : {
            hour:"07:52",
            day:"Saturday"
        },
        "On Vehicle" : {
            hour:"23:27",
            day:"Friday"
        }
    }
    
    var ctp = document.getElementById("pieChart").getContext('2d');
    var myPieChart = new Chart(ctp, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: data,
                backgroundColor: colors
            }],
            labels: labels
        },
        options: {
            legend: {
                position: 'bottom'
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                            return previousValue + currentValue;
                        });
                        var currentValue = dataset.data[tooltipItem.index];
                        var precentage = Math.floor(((currentValue/total) * 100)+0.5);         
                        return precentage + "% " + data.labels[tooltipItem.index];
                    }
                }
            }
        }
    });

    function changeChartData(chart, labels, data) {
        
        chart.data.datasets[0].data = data
        chart.data.labels = labels
        
        colors = []
        for(i = 0;i<data.length;i++)
            colors.push("rgb("+getRandomInt(256)+","+getRandomInt(256)+","+getRandomInt(256)+")")
        chart.data.datasets[0].backgroundColor=colors


        chart.update();
    }

    function analyze(){

        period = null;
        if(document.getElementById("check").checked){
            var first_month = document.getElementById("first_month").value
            var last_month = document.getElementById("last_month").value
            var first_year = document.getElementById("first_year").value
            var last_year = document.getElementById("last_year").value

            if(!first_month || !last_month || !first_year || !last_year){
                alert("fields cannot be blanc, thank you")
                return;
            }

            period = {
                first_month :first_month,
                last_month :last_month,
                first_year :first_year,
                last_year :last_year 
            }           

        }else{
            var first_month = document.getElementById("first_month").value
            var first_year = document.getElementById("first_year").value

            if(!first_month || !first_year){
                alert("fields cannot be blanc, thank you")
                return;
            }

            period = {
                first_month :first_month,
                last_month : null,
                first_year :first_year,
                last_year : null
            }
        }
        
        $.ajax({
                url: 'http://localhost:3000/periodUpload',
                data: JSON.stringify(period),
                cache: false,
                contentType: "application/json",
                processData: false,
                method: 'POST',
                success: function(){
                    $.get( "/downloadPeriodData", function( periodData ) {
                        updateData(periodData)
                    });
                }
            });
    }

    function updateData(data){
        
        labels = data.labels
        percentages = data.percentages
        weeks = data.weeks
        heatmapData = data.heatmapData

        createHeat(heatmapData)
        changeChartData(myPieChart,labels,percentages)
        updateTable()
    }



    function tableElement(element,row){
        td = document.createElement('td');
        td.appendChild(document.createTextNode(element));
        row.appendChild(td);
    }

    function tableRow(elements,table){
        tr = document.createElement('tr');

        elements.forEach(function iteration(value, index, array){
            tableElement(value,tr)
        })

        table.appendChild(tr);
    }
    
    function updateTable(){
        var new_tbody = document.createElement('tbody');
        document.getElementById("hourBody").replaceWith(new_tbody)
        new_tbody.id = "hourBody"
        labels.forEach(function iteration(value, index, array){
            tableRow([value,weeks[value].hour,weeks[value].day],new_tbody)
        })
    }

    

    var map = L.map('mapid').setView([38.230462,21.753150], 12);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);

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


    function createHeat(testData){
        heatmapLayer.remove()
        map.addLayer(heatmapLayer);
        heatmapLayer.setData(testData);
    }
