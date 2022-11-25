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
    var tables = ['airport', 'chestnut_hill_east', 'chestnut_hill_west', 'eastwick', 'ff', 'fox_chase', 'media', 'paoli', 'gg']
    tables.forEach((table) => {
        var sql = `CREATE TABLE if not exists ${table}_train (train VARCHAR(255), direction VARCHAR(255), time VARCHAR(255), station VARCHAR(255), minutes_late INT(3), last_update DATETIME )`;
        con.query(sql, function (err, result) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                return;
            }  
            if(result.warningCount == 1) {
                console.log(`${table}_train table created`);
            }
        });
    });
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