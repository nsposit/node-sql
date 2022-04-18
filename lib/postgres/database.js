"use strict";

const pg = require("pg");
const _Database = require("../core/database");
const Table = require("./table");

module.exports = class Database extends _Database {
    host;
    user;
    password;
    database;
    options;
    pool;
    operators;
    comparisons;

    // TODO: Add support for connection string 
    // connectionString?: string, // e.g. postgres://user:password@host:5432/database

    constructor(
        host,
        user,
        password,
        database,
        options
    ) {
        super();
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;

        const defaultOptions = {
            port: 5432,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 10000,
            ssl: {
                rejectUnauthorized: false
            }
        }
        this.options = { ...defaultOptions, ...options };

        this.pool = new pg.Pool({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database,
            port: this.port,
            ...this.options
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
            const client = await this.pool.connect();
            await client.query('SELECT NOW()')
            console.log("Successfully connected to database...");
            client.release();
            return true;
        } catch (ex) {
            console.error("Error connecting to database...", ex);
            return false;
        }

    }

    async query(sql, values) {
        try {
            console.log(sql);
            const {rows} = await this.pool.query(sql, values);
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