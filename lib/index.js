const mysql = require("mysql2/promise");
const Joi = require("joi");

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
}

class Table {
  database;
  name;
  schema;
  defaultFindArgs;

  constructor(
    database,
    name,
    schema,
    defaultFindArgs = { limit: 10, page: 1, order: "DESC", orderby: "" }
  ) {
    this.database = database;
    this.name = name;
    this.schema = schema;
    this.defaultFindArgs = defaultFindArgs;
  }

  async find(args) {
    try {
      const { error } = Joi.object({
        limit: Joi.number().min(1),
        page: Joi.number().min(1),
        order: Joi.string().valid("asc", "ASC", "desc", "DESC"),
        orderby: Joi.string(), //validate against this.schema
      }).validate(args);
      if (error) throw error.details[0].message;

      const merged = {
        ...this.defaultFindArgs,
        ...args,
      };

      let query = `SELECT * FROM ${this.name}`;
      if (merged.orderby) {
        query += ` ORDER BY ${merged.orderby} ${merged.order}`;
      }
      query += ` LIMIT ${merged.limit}`;
      if (merged.page) {
        let offset = (parseInt(merged.page) - 1) * parseInt(merged.limit);
        query += ` OFFSET ${offset}`;
      }
      const rows = await this.database.query(query);

      return rows;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async findWhere(key, value, operator = "=") {
    try {
      let query = `SELECT * FROM ${this.name} WHERE ${key} ${operator} ?`;
      const rows = await this.database.query(query,[value]);
      return rows;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async findOne(id) {
    try {
      let query = `SELECT * FROM ${this.name} WHERE id = ?`;
      const [rows] = await this.database.query(query, [id]);
      return rows;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async findOneBy(key, value) {
    try {
      let query = `SELECT * FROM ${this.name} WHERE ${key} = ?`;
      const [rows] = await this.database.query(query, [value]);
      return rows;
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

  async create(obj) {
    try {
      let keys = Object.keys(obj).toString();
      let values = Object.values(obj);
      let namespace = "?,".repeat(values.length).slice(0, -1);
      let query = `INSERT INTO ${this.name} (${keys}) VALUES (${namespace})`;
      const result = await this.database.query(query, values);
      return { id: result.insertId, ...obj };
    } catch (ex) {
      console.error("Error: ", ex);
      throw ex;
    }
  }

}

exports.Database = Database;
exports.Table = Table;
