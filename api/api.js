const express = require('express');
const apiRouter = express.Router()

const sqlite3 = require('sqlite3');
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const menuRouter = require('./menu.js')
const employeesRouter = require('./employee.js')

apiRouter.use('/employees', employeesRouter)
apiRouter.use('/menus', menuRouter)

module.exports = apiRouter
