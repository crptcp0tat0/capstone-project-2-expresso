const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//Code Here
const employeeCheck = (req, res, next) => {
  const id = req.params.id || req.params.employeeId
  db.get(`SELECT * FROM Employee WHERE id = ${id}`, (err, row) => {
    if (row) {
      next();
    } else {
      return res.sendStatus(404);
    }
  })
}

const employeeValidation = (req, res, next) => {
  const employee = req.body.employee
  if (!employee.name || !employee.position || !employee.wage) {
    return res.sendStatus(400);
  } else {
    next()
  }
}

const employeeInTimesheetCheck = (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, rows) => {
    if (rows.length === 0) {
      res.status(404).json({timesheets:[]})
    } else {
      next();
    }
  })
}

const timesheetValidation = (req, res, next) => {
  const timesheet = req.body.timesheet
  if (!timesheet.hours || !timesheet.rate || !timesheet.date) {
    return res.sendStatus(400)
  } else {
    next();
  }
}

const timesheetCheck = (req, res, next) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) => {
    if (!row) {
      return res.sendStatus(404);
    } else {
      next();
    }
  })
}
//Okay real talk now...we know you got a new keyboard and all but you don't have
//write req.params.id everytime when you could've easily declared a constant (id)
//pls refactr code asap

employeesRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err, rows) => {
    res.status(200).json({employees: rows})
  })
})

employeesRouter.get('/:id', employeeCheck, (req, res, next) => {
  db.get(`SELECT * FROM Employee WHERE id = ${req.params.id}`, (err, row) => {
    res.status(200).json({employee: row})
  })
})

employeesRouter.post('/', employeeValidation, (req, res, next) => {
  const employee = req.body.employee
  db.run(`INSERT INTO Employee (name, position, wage) VALUES ('${employee.name}', '${employee.position}', ${employee.wage})`, function(error) {
    db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) => {
      res.status(201).json({employee: row})
    })
  })
})

employeesRouter.put('/:id', employeeValidation, (req, res, next) => {
  const employee = req.body.employee
  db.serialize(() => {
    db.run(`UPDATE Employee SET name = '${employee.name}', position = '${employee.position}', wage = ${employee.wage} WHERE id = ${req.params.id}`)
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.id}`, (err, row) => {
      res.status(200).json({employee: row})
    })
  })
})

employeesRouter.delete('/:id', employeeCheck, (req, res, next) => {
  db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ${req.params.id}`, function(error) {
    db.get(`SELECT * FROM Employee WHERE id = ${req.params.id}`, (err, row) => {
      res.status(200).json({employee: row})
    })
  })
})

employeesRouter.get('/:employeeId/timesheets', employeeInTimesheetCheck, (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, rows) => {
    res.status(200).json({timesheets: rows})
  })
})

employeesRouter.post('/:employeeId/timesheets', employeeCheck, timesheetValidation, (req, res, next) => {
  const timesheet = req.body.timesheet;
  db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES (${timesheet.hours}, ${timesheet.rate}, ${timesheet.date}, ${req.params.employeeId})`, function(error) {
    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
      res.status(201).json({timesheet: row})
    })
  })
})

employeesRouter.put('/:employeeId/timesheets/:timesheetId', employeeCheck, timesheetCheck, timesheetValidation, (req, res, next) => {
  const timesheet = req.body.timesheet
  db.serialize(() => {
    db.run(`UPDATE Timesheet SET hours = ${timesheet.hours}, rate = ${timesheet.rate}, date = ${timesheet.date} WHERE id = ${req.params.timesheetId}`)
    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) => {
      res.status(200).json({timesheet: row})
    })
  })
})

employeesRouter.delete('/:employeeId/timesheets/:timesheetId', timesheetCheck, employeeCheck, (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) => {
    return res.sendStatus(204);
  })
})

//NO!

module.exports = employeesRouter
