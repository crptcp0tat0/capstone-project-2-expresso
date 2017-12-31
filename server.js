const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');

const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


app.use(cors())
app.use(errorhandler())
app.use(bodyParser.json())

const PORT = process.env.PORT || 4000

//Code Here
const apiRouter = require('./api/api.js')
app.use('/api', apiRouter)

app.listen(PORT, () => {
  `Server is listening on ${PORT}`
})

module.exports = app;
