"use strict"; 

const mysql = require("mysql2/promise");
const Table = require('./table');

module.exports = class Database {
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

  table(
    name,
    schema,
    defaults = { limit: 10, page: 1, order: "DESC", orderby: "" }
  ) {
    return new Table(this, name, schema, defaults);
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