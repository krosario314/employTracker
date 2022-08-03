const express = require('express')
const mysql = require('mysql')
// my connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: ''
})

// connection to mysql
db.connect(err => {
    if(err) {
        throw err 
    }
    console.log('MySQL Connection')
})

// connecting to express
const app = express()

// my database
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodedbsql'
    db.query(sql, err => {
        if(err) {
            throw err 
        }
        res.send('Database Created')
    })
})