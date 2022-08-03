const express = require('express')
const mysql = require('mysql')
// my connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: ''
})

// 