# @nathaniel.sposit/sql

JavaScript interface for mySQL queries

## Install

```bash
# with npm
npm install @nathaniel.sposit/sql
```

## Usage

Create .env file in the root directory

```dosini
DB_HOST=localhost
DB_USER=root
DB_PASS=toor
DB_NAME=example
```

Connect to database and create a table model

```javascript
const sql = require("@nathaniel.sposit/sql");

// create db connection
const db = new sql.Database(
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASS,
  process.env.DB_NAME
);

// create table model
const tbl = new sql.Table(db, "example_tbl", {
  id: {
    type: "int",
    isPrimaryKey: true,
    autoIncrement: true,
  },
  field: {
    type: "varchar(256)",
  },
  created: {
    type: "datetime",
  },
});
```

Performing a SELECT operation (with WHERE and ORDER BY)

```javascript
  const rows = await tbl.select(
    ["field"],
    [
      {
        key: "field",
        value: "some value",
        operator: "=", // default operator
        comparison: "AND" // default comparison
      }
    ],
    'created', //orderby 
    'DESC' // default order
   );
```
