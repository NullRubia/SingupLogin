import mysql from "mysql2";
import { database } from "./database.mjs";

// mysql.createConnection 그때그때 연결
//미리 풀로 연결해둠
const pool = mysql.createPool({
  host: database.db.host,
  user: database.db.user,
  database: database.db.database,
  password: database.db.password,
});

export const db = pool.promise();
