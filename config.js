const mysql = require('mysql2/promise');

class DB {
  constructor() {
    this.server = "rst-mgmt01.c3yymsegwsj7.ap-south-1.rds.amazonaws.com";
    this.user = "rst_admin";
    this.pass = "reastaurant2024";
    this.db = "rst_mgmt01";
    this.con = null;
  }

  async connect() {
    try {
      this.con = await mysql.createConnection({
        host: this.server,
        user: this.user,
        password: this.pass,
        database: this.db,
        port: 3306
      });
      console.log("Connected to the database.");
    } catch (err) {
      console.error("Connection failed: ", err);
    }
  }

  async close() {
    if (this.con) {
      await this.con.end();
      console.log("Connection closed.");
    }
  }

  async query(sql, params = []) {
    try {
      const [result] = await this.con.execute(sql, params);
      return result;
    } catch (err) {
      console.error("Query failed: ", err);
      return null;
    }
  }

  async row(sql, params = []) {
    try {
      const [rows] = await this.con.execute(sql, params);
      return rows.length;
    } catch (err) {
      console.error("Row count failed: ", err);
      return 0;
    }
  }

  async arr(sql, params = []) {
    try {
      const [rows] = await this.con.execute(sql, params);
      return rows[0] || null;
    } catch (err) {
      console.error("Fetching array failed: ", err);
      return null;
    }
  }

  async num(sql, params = []) {
    try {
      const [rows] = await this.con.execute(sql, params);
      return rows.length;
    } catch (err) {
      console.error("Row number failed: ", err);
      return 0;
    }
  }

  async fetch(sql, params = []) {
    try {
      const [rows] = await this.con.execute(sql, params);
      return rows;
    } catch (err) {
      console.error("Fetching failed: ", err);
      return [];
    }
  }
}

module.exports = DB;
