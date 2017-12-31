const express = require('express')
const menusRouter = express.Router({mergeParameters: true});

const sqlite3 = require('sqlite3');
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

const menuCheck = (req, res, next) => {
  const id = req.params.id || req.params.menuId
  db.get(`SELECT * FROM Menu WHERE id = ${id}`, (err, row) => {
    if (!row) {
      res.status(404).json({menuItems: []});
    } else {
      next();
    }
  })
}

const menuValidation = (req, res, next) => {
  const menu = req.body.menu;
  if (!menu.title) {
    return res.sendStatus(400)
  } else {
    next();
  }
}

const menuAsForeignKey = (req, res, next) => {
  const id = req.params.id || req.params.menuId
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${id}`, (err, rows) => {
    if (rows.length === 0) {
      next();
    } else {
      return res.sendStatus(400)
    }
  })
}

const menuItemValidation = (req, res, next) => {
  const menuItem = req.body.menuItem;
  if (!menuItem.name || !menuItem.inventory || !menuItem.price) {
    return res.sendStatus(400)
  } else {
    next()
  }
}

const menuItemCheck = (req, res, next) => {
  const id = req.params.menuItemId
  db.get(`SELECT * FROM MenuItem WHERE id = ${id}`, (err, row) => {
    if (!row) {
      return res.sendStatus(404);
    } else {
      next();
    }
  })
}
/*const menuInItemsCheck = (req, res, next) => {
  const id = req.params.id || req.params.menuId
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${id}`, (err, rows) => {
    if (rows.length === 0) {
      res.status(200).json({menuItems: []})
    }
  })
}*/

//Code Here
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    res.status(200).json({menus: rows})
  })
})

menusRouter.get('/:id', menuCheck, (req, res, next) => {
  db.get(`SELECT * FROM Menu WHERE id = ${req.params.id}`, (err, row) => {
    res.status(200).json({menu: row})
  })
})

menusRouter.post('/', menuValidation, (req, res, next) => {
  const menu = req.body.menu
  db.run(`INSERT INTO Menu (title) VALUES ('${menu.title}')`, function(err) {
    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
      res.status(201).json({menu: row})
    })
  })
})

menusRouter.put('/:id', menuCheck, menuValidation, (req, res, next) => {
  const menu = req.body.menu
  db.serialize(() => {
    db.run(`UPDATE Menu SET title = '${menu.title}'`)
    db.get(`SELECT * FROM Menu WHERE id = ${req.params.id}`, (err, row) => {
      res.status(200).json({menu: row})
    })
  })
})

menusRouter.delete('/:id', menuCheck, menuAsForeignKey, (req, res, next) => {
  db.run(`DELETE FROM Menu WHERE id = ${req.params.id}`, (err) => {
    return res.sendStatus(204);
  })
})

menusRouter.get('/:menuId/menu-items', menuCheck, (req, res, next) => {
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, rows) => {
    res.status(200).json({menuItems: rows})
  })
})

menusRouter.post('/:menuId/menu-items', menuItemValidation, (req, res, next) => {
  const menuItem = req.body.menuItem
  db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ('${menuItem.name}', '${menuItem.description}', ${menuItem.inventory}, ${menuItem.price}, ${req.params.menuId})`, function(err) {
    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
      res.status(201).json({menuItem: row})
    })
  })
})

menusRouter.put('/:menuId/menu-items/:menuItemId', menuItemCheck, menuItemValidation, (req, res, next) => {
  const menuItem = req.body.menuItem
  db.serialize(() => {
    db.run(`UPDATE MenuItem SET name = '${menuItem.name}', description = '${menuItem.description}', inventory = ${menuItem.inventory}, price = ${menuItem.price} WHERE id = ${req.params.menuItemId}`)
    db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, row) => {
      res.status(200).json({menuItem: row})
    })
  })
})

menusRouter.delete('/:menuId/menu-items/:menuItemId', menuItemCheck, (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err) => {
    return res.sendStatus(204)
  })
})


module.exports = menusRouter;
