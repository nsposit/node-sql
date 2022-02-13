# @nate.sposit/node-sql

JavaScript interface for mySQL and postgreSQL

## Install

```bash
# with npm
npm install @nate.sposit/node-sql --save
```

## Usage

Set the environment variabes

```dosini
DB_HOST=localhost
DB_USER=root
DB_PASS=toor
DB_NAME=example
```

Require mySQL

```javascript
const sql = require("@nate.sposit/node-sql/mysql");
```

Require postgreSQL

```javascript
const sql = require("@nate.sposit/node-sql/postgres");
```

Connect to database and create a table model

```javascript

// create db connection
const db = new sql.Database(
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASS,
  process.env.DB_NAME
);

// create table model 
tableName = "foo"; 
const tbl = new sql.Table(db, tableName, {
  id: {
    type: "int",
    isPrimaryKey: true,
    autoIncrement: true,
  },
  foo: {
    type: "varchar(256)",
  },
  created: {
    type: "datetime",
  },
});

// *** preferred method ***
// create table model from instance of database 
const tbl = db.table(tableName, {
  id: {
    type: "int",
    isPrimaryKey: true,
    autoIncrement: true,
  },
  foo: {
    type: "varchar(256)",
  },
  created: {
    type: "datetime",
  },
});
```

Performing an INSERT operation

```javascript
  const { id } = await tbl.insert({ foo: "bar" });

  // expect: id = 1;
```

Performing a SELECT operation

```javascript
  id = 1;
  // select using WHERE and ORDER BY
  const rows = await tbl.select(
    ["foo"], // empty array to select all fields *
    [
      {
        key: "id",
        value: id,
        operator: "=", // default operator
        comparison: "AND" // default comparison
      }
    ],
    'created', //orderby 
    'DESC' // default order
   );

   // select one by id
    const row = await tbl.selectOne(id);

    // optionally specify the fields 
    const row = await tbl.selectOne(id, ["foo"]);

    // expect: [{foo: "bar"}];
```

Performing an UPDATE operation

```javascript
  id = 1; 
  // update using WHERE
  const result = await tbl.update({ foo: "bar"  }, [
        { key: "id", value: id },
      ]);

  // update one by id
  const result = await tbl.updateOne(id, { foo: "bar" });

  // expect: result = true;
```

Performing a DELETE operation

```javascript
  id = 1; 
  // delete using WHERE
  const result = await tbl.delete([{ key: "id", value: id }]);

  // delete one by id
  const result = await tbl.deleteOne(id);

  // expect: result = true;
```
## Planned Future Functionality
* Add pre-query input value validation
* Add extended support for running pools and rollbacks
* Add support for running stored procedures
* Add support for database initialization and migrations