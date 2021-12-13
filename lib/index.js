const mysql = require("mysql2/promise");

class Database {
  host;
  user;
  password;
  database;
  port;
  waitForConnections;
  connectionLimit;
  queueLimit;
  debug;
  pool;
  operators;
  comparisons;

  constructor(
    host,
    user,
    password,
    database,
    port = 3306,
    waitForConnections = true,
    connectionLimit = 2,
    queueLimit = 0,
    debug = false
  ) {
    this.host = host;
    this.user = user;
    this.password = password;
    this.database = database;
    (this.port = port), (this.waitForConnections = waitForConnections);
    this.connectionLimit = connectionLimit;
    this.queueLimit = queueLimit;
    this.debug = debug;
    this.pool = mysql.createPool({
      host: this.host,
      user: this.user,
      password: this.password,
      database: this.database,
      port: this.port,
      waitForConnections: this.waitForConnections,
      connectionLimit: this.connectionLimit,
      queueLimit: this.queueLimit,
      debug: this.debug,
    });
    this.operators = [
      "=",
      ">",
      ">=",
      "<",
      "!=",
      "<=",
      "LIKE",
      "NOT LIKE",
      "REGEXP",
      "NOT REGEXP",
    ];
    this.comparisons = ["AND", "OR", "XOR"];
  }

  async checkConnection() {
    try {
      const connection = await mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.database,
        port: this.port,
        waitForConnections: this.waitForConnections,
        connectionLimit: this.connectionLimit,
        queueLimit: this.queueLimit,
        debug: this.debug,
      });
      console.log("Successfully connected to database...");
      connection.destroy();
      return true;
    } catch (ex) {
      console.error("Error connecting to database...", ex);
      return false;
    }
  }

  async query(sql, values) {
    try {
      const [rows, fields] = await this.pool.execute(sql, values);
      return rows;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async closePool() {
    try {
      this.pool.end();
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }
}


class Table {
  database;
  name;
  schema;
  defaults;

  constructor(
    database,
    name,
    schema,
    defaults = { limit: 10, page: 1, order: "DESC", orderby: "" }
  ) {
    this.database = database;
    this.name = name;
    this.schema = schema;
    this.defaults = defaults;
  }

  async select(
    fields = [],
    where = [],
    orderby = this.defaults.orderby,
    order = this.defaults.order,
    limit = this.defaults.limit,
    page = this.defaults.page
  ) {
    try {
      let values = [];

      let fieldsValue = "*";
      if (fields.length != 0) {
        for (const field of fields) {
          console.log(field);
          if (!this.schema.hasOwnProperty(field)) {
            throw new Error(
              `Cannot SELECT field ${field} because it is not in the schema of ${this.name}.`
            );
          }
        }
        fieldsValue = fields.join(",");
      }

      let query = `SELECT ${fieldsValue} FROM ${this.name}`;

      if (where.length != 0) {
        query += ` WHERE`;
        for (var w of where) {
          console.log(w);
          if (!this.schema.hasOwnProperty(w.key)) {
            throw new Error(
              `Cannot perform WHERE operation with field ${w.key} because it is not in the schema of ${this.name}.`
            );
          }
          let operator = "=";
          if (w.hasOwnProperty("operator")) {
            if (!this.database.operators.includes(w.operator)) {
              throw new Error(
                `Cannot perform WHERE operation with field ${w.key} because an invalid operator ${w.operator} was provided.`
              );
            }
            operator = w.operator;
          }
          let comparison = "AND";
          if (w.hasOwnProperty("comparison")) {
            if (!this.database.comparisons.includes(w.comparison)) {
              throw new Error(
                `Cannot perform WHERE operation with field ${w.key} because an invalid comparison ${w.comparison} was provided.`
              );
            }
            comparison = w.comparison;
          }
          if (where.indexOf(w) != 0) {
            query += ` ${comparison}`;
          }
          query += ` ${w.key} ${operator} ?`;
          values.push(w.value);
        }
      }

      if (orderby) {
        const orders = ["ASC", "DESC"];
        if (!this.schema.hasOwnProperty(orderby)) {
          throw new Error(
            `Cannot perform ORDER BY operation with field ${orderby} because it is not in the schema of ${this.name}.`
          );
        }
        if (!orders.includes(order)) {
          throw new Error(
            `Cannot perform ORDER BY operation with field ${orderby} because an invalid order value ${order} was provided.`
          );
        }
        query += ` ORDER BY ${orderby} ${order}`;
      }
      if (limit > 0) {
        query += ` LIMIT ${limit}`;
        if (page) {
          let offset = (parseInt(page) - 1) * parseInt(limit);
          query += ` OFFSET ${offset}`;
        }
      }

      console.log(query);
      console.log(values);

      const rows = await this.database.query(query, values);
      return rows;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async insert(obj) {
    let keys = Object.keys(obj);
    for (const key of keys) {
      if (!this.schema.hasOwnProperty(key)) {
        throw new Error(
          `Cannot INSERT field ${key} because it is not in the schema of ${this.name}.`
        );
      }
    }
    let values = Object.values(obj); // check value types
    let namespace = "?,".repeat(values.length).slice(0, -1);
    let query = `INSERT INTO ${
      this.name
    } (${keys.toString()}) VALUES (${namespace})`;
    try {
      const result = await this.database.query(query, values);
      return { id: result.insertId };
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async update(obj, where = []) {
    try {
      let keys = Object.keys(obj);
      for (const key of keys) {
        if (!this.schema.hasOwnProperty(key)) {
          throw new Error(
            `Cannot INSERT field ${key} because it is not in the schema of ${this.name}.`
          );
        }
      }
      let values = Object.values(obj); // check value types
      let query = `UPDATE ${this.name} SET `;
      for (let i in keys) query += keys[i] + " = ?,";
      query = query.slice(0, -1);

      if (where.length != 0) {
        query += ` WHERE`;
        for (var w of where) {
          console.log(w);
          if (!this.schema.hasOwnProperty(w.key)) {
            throw new Error(
              `Cannot perform WHERE operation with field ${w.key} because it is not in the schema of ${this.name}.`
            );
          }
          let operator = "=";
          if (w.hasOwnProperty("operator")) {
            if (!this.database.operators.includes(w.operator)) {
              throw new Error(
                `Cannot perform WHERE operation with field ${w.key} because an invalid operator ${w.operator} was provided.`
              );
            }
            operator = w.operator;
          }
          let comparison = "AND";
          if (w.hasOwnProperty("comparison")) {
            if (!this.database.comparisons.includes(w.comparison)) {
              throw new Error(
                `Cannot perform WHERE operation with field ${w.key} because an invalid comparison ${w.comparison} was provided.`
              );
            }
            comparison = w.comparison;
          }
          if (where.indexOf(w) != 0) {
            query += ` ${comparison}`;
          }
          query += ` ${w.key} ${operator} ?`;
          values.push(w.value);
        }
      }

      const result = await this.database.query(query, values);
      if (result.affectedRows < 1) throw new Error("No rows updated.");
      return true;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async delete(where) {
    try {
      let values = [];

      let query = `DELETE FROM ${this.name}`;

      if (where.length == 0) {
        throw new Error(
          `Cannot perform DELETE operation because at WHERE cannot be empty.`
        );
      }
      query += ` WHERE`;
      for (var w of where) {
        console.log(w);
        if (!this.schema.hasOwnProperty(w.key)) {
          throw new Error(
            `Cannot perform WHERE operation with field ${w.key} because it is not in the schema of ${this.name}.`
          );
        }
        let operator = "=";
        if (w.hasOwnProperty("operator")) {
          if (!this.database.operators.includes(w.operator)) {
            throw new Error(
              `Cannot perform WHERE operation with field ${w.key} because an invalid operator ${w.operator} was provided.`
            );
          }
          operator = w.operator;
        }
        let comparison = "AND";
        if (w.hasOwnProperty("comparison")) {
          if (!this.database.comparisons.includes(w.comparison)) {
            throw new Error(
              `Cannot perform WHERE operation with field ${w.key} because an invalid comparison ${w.comparison} was provided.`
            );
          }
          comparison = w.comparison;
        }
        if (where.indexOf(w) != 0) {
          query += ` ${comparison}`;
        }
        query += ` ${w.key} ${operator} ?`;
        values.push(w.value);
      }

      const result = await this.database.query(query, values);
      if (result.affectedRows < 1) throw new Error("No rows deleted.");
      return true;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async selectOne(id, fields = []) {
    try {
      const [row] = await this.select(fields, [
        {
          key: "id",
          value: id,
        },
      ]);
      return row;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async updateOne(id, obj) {
    try {
      return await this.update(obj, [
        {
          key: "id",
          value: id,
        },
      ]);
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async deleteOne(id) {
    try {
     return await this.delete([
      {
        key: "id",
        value: id,
      },
    ]);
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }
}

exports.Database = Database;
exports.Table = Table;
