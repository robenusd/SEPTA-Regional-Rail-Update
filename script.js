var settings = {
  "url": "https://cors-anywhere.herokuapp.com/https://www3.septa.org/api/Arrivals/index.php?station="+$("#value")['0']['outerText'],
  "method": "GET",
  "timeout": 0,
  "crossDomain": true,
  "headers": {
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "https://www3.septa.org"
  },
};
var table = window.location.href.split(/[/.]+/)[15];


var current = new Date()
var month = current.toLocaleString('default', {month: 'long'});
var date = current.getDate();
var year = current.getFullYear();

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

var train_schedule = []
var tr_id = []
var late = []
var station = []
var station_late = []
var time = []
var origin = []
var destination = []
var direction = []

function apicall() {
  return $.ajax(settings).done(function (response) {
    return response
  });
};

function scheduleapi(schedule) {
  return $.ajax(schedule).done(function (res) {
    return res
  });
}

apicall().then(function(res) {
  var data = res[$("#value")['0']['outerText']+ ' Departures: ' + month + ' ' + date + ', ' + year + ', ' + formatAMPM(current)]
  if(data) {
    data.forEach ((d) => {
      // console.log(d);
      if(d['Southbound']){
        d['Southbound'].forEach ( (t) => {
          var schedule = {
            "url": "https://cors-anywhere.herokuapp.com/https://www3.septa.org/api/RRSchedules/index.php?req1="+t['train_id'],
            "method": "GET",
            "timeout": 0,
            "crossDomain": true,
            "headers": {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "https://www3.septa.org"
            },
            
          };
    
          scheduleapi(schedule).then(function(res) {
            res.forEach((r => {
              tr_id.push(t['train_id'])
              origin.push(t['origin'])
              destination.push(t['destination'])
              direction.push(t['direction'])
            }))
            train_schedule.push(...res)
          })
        }); 
      }
      else if(d['Northbound']){
        d['Northbound'].forEach ( (t) => {
          var schedule = {
            "url": "https://cors-anywhere.herokuapp.com/https://www3.septa.org/api/RRSchedules/index.php?req1="+t['train_id'],
            "method": "GET",
            "timeout": 0,
            "crossDomain": true,
            "headers": {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "https://www3.septa.org"
            },
            
          };
    
          scheduleapi(schedule).then(function(res) {
            res.forEach((r => {
              tr_id.push(t['train_id'])
              origin.push(t['origin'])
              destination.push(t['destination'])
              direction.push(t['direction'])
            }))
            train_schedule.push(...res)
          })
        }); 
      }
      else if(d['Southbound'] && d['Northbound']){
        d['Southbound'].forEach ( (t) => {
          var schedule = {
            "url": "https://cors-anywhere.herokuapp.com/https://www3.septa.org/api/RRSchedules/index.php?req1="+t['train_id'],
            "method": "GET",
            "timeout": 0,
            "crossDomain": true,
            "headers": {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "https://www3.septa.org"
            },
            
          };
    
          scheduleapi(schedule).then(function(res) {
            res.forEach((r => {
              tr_id.push(t['train_id'])
              origin.push(t['origin'])
              destination.push(t['destination'])
              direction.push(t['direction'])
            }))
            train_schedule.push(...res)
          })
        }); 
        d['Northbound'].forEach ( (t) => {
          var schedule = {
            "url": "https://cors-anywhere.herokuapp.com/https://www3.septa.org/api/RRSchedules/index.php?req1="+t['train_id'],
            "method": "GET",
            "timeout": 0,
            "crossDomain": true,
            "headers": {
                "Accept": "application/json",
                "Access-Control-Allow-Origin": "https://www3.septa.org"
            },
            
          };
    
          scheduleapi(schedule).then(function(res) {
            res.forEach((r => {
              tr_id.push(t['train_id'])
              origin.push(t['origin'])
              destination.push(t['destination'])
              direction.push(t['direction'])
            }))
            train_schedule.push(...res)
          })
        }); 
      }
      else{
        console.log('No train found');
      }  

    });
  }
  else {
    console.log('No train found');
  }
})

setTimeout(() => {
  console.log("Delayed for 2 second.");
  // console.log(train_schedule);
  computation (train_schedule)
  getFromDatabase()
}, 2000)


function computation (train_schedule) {
  // console.log(train_schedule.length);
  train_schedule.forEach((ts) => {
    var est = ts['est_tm'].split(/[: ]+/);
    var sched = ts['sched_tm'].split(/[: ]+/);
    var est_tm = (parseInt(est[0], 10) * 60 * 60) + (parseInt(est[1], 10) * 60)
    var sched_tm = (parseInt(sched[0], 10) * 60 * 60) + (parseInt(sched[1], 10) * 60)
    time.push(ts['sched_tm'])
    station.push(ts['station'])
    late.push((est_tm-sched_tm)/60)
  });

  station_late = station.map( function(x, i){
    return {"station": x, "late": late[i], "train": tr_id[i]+' - '+origin[i]+' - '+destination[i], "direction": direction[i], "time": time[i]}  
  }.bind(this));

  addToDatabase(station_late)
  

  //return station_late;
}

function dynamicTableRender(s) {
  jQuery.each(s, function(index, x) {
    // console.log(new Date - new Date((x['last_updated'].split(' ')[0])));
      var tr = $('<tr />');
        tr.append( $('<td />', {text : x['train']}) );
        tr.append( $('<td />', {text : x['direction']}) );
        tr.append( $('<td />', {text : x['time']}) );
        tr.append( $('<td />', {text : x['station']}) );
        tr.append( $('<td />', {text : x['minutes_late']}) );
        tr.append( $('<td />', {text : x['last_updated']}) );
    $("#tbodyDynamic").append(tr);
});
}

async function getFromDatabase() {
  const url = `http://localhost:3000/routes/${table}`;

  await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // console.log(data);
      dynamicTableRender(data['result'])
    })
    .catch((error) => console.error('Error:', error));
}

async function addToDatabase(data) {
  const url = 'http://localhost:3000/routes';

  await fetch(url, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'data': data,
      'table': table }),
  })
    .then((response) => response.json())
    // .then((data) => console.log(data))
    .catch((error) => console.error('Error:', error));
}

