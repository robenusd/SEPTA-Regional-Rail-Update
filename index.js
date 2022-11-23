const express = require('express');
const cors = require('cors');
const mysql = require('mysql');




const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "project123",
    database: 'csc_8542',
    timezone: 'utc'
});



con.connect(function(err) {
    if (err) throw err;
    console.log('Connected to database!')
//     var table1 = "CREATE TABLE airport_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )";
//     con.query(table1, function (err, result) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }  
//     console.log("Table created");
//   });
//     var table2 = "CREATE TABLE chestnut_hill_east_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )";
//     con.query(table2, function (err, result) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }  
//     console.log("Table created");
//   });
//     var table3 = "CREATE TABLE chestnut_hill_west_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )";
//     con.query(table3, function (err, result) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }  
//     console.log("Table created");
//   });
//     var table4 = "CREATE TABLE eastwick_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )";
//     con.query(table4, function (err, result) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }  
//     console.log("Table created");
//   });
//     var table5 = "CREATE TABLE fox_chase_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )";
//     con.query(table5, function (err, result) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }  
//     console.log("Table created");
//   });
//     var table6 = "CREATE TABLE media_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )";
//     con.query(table6, function (err, result) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }  
//     console.log("Table created");
//   });
//     var table7 = "CREATE TABLE paoli_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )";
//     con.query(table7, function (err, result) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }  
//     console.log("Table created");
//   });
})

const app = express();

app.use(express.json());
app.use(cors());


app.post("/routes", (req, res) => {
    const result = req.body.data
    const table = req.body.table
    let sql

    if (!result) {
        return res.sendStatus(400)
    }
    
    result.forEach((r) => {
        if(r['late']>0)
        {
            sql = `INSERT INTO ${table}_train (train, direction, time, station, minutes_late, last_update) VALUES ('${r['train']}', '${r['direction']}', '${r['time']}', '${r['station']}', '${r['late']}', now());`

            con.query(sql, function(err, result) {
                if (err) throw err;
            })
        }
        
    })
    res.sendStatus(201)
})

app.get("/routes/:table", (req, res) => {
    const table = req.params.table
    let sql = `SELECT * FROM ${table}_train WHERE last_update BETWEEN (SELECT DATE_SUB(now(), INTERVAL 7 DAY)) AND NOW();`
    let ret = []

    con.query(sql, function(err, result) {
        if (err) throw err;
        result.forEach(element => {
            ret.push({
                'train': element.train, 
                'direction': element.direction, 
                'time': element.time, 
                'station': element.station, 
                'minutes_late': element.minutes_late,
                'last_updated': element.last_update
            })
        });

        res.json({
            'result': ret
        })
    });
})

app.listen(3000, () => console.log('API server running...'))