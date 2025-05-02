import { db } from "./db.mjs";

export async function getUsers() {
  const [rows] = await db.query("select * from users");
  //console.log(rows);
  return rows;
}

export async function createUser(userid, userpw, name, email) {
  const [result] = await db.query(
    "insert into users (userid, userpw, name, email) values(?, ?, ?, ?)",
    [userid, userpw, name, email]
  );
  return result.insertId;
}

//update
export async function updateUser(userid, newEmail) {
  const [result] = await db.query("update users set email=? where userid=?", [
    newEmail,
    userid,
  ]);
  return result.affectedRows;
}

//delete

export async function deleteUser(userid) {
  const [result] = await db.query("delete from users where userid=?", [userid]);
  return result.affectedRows;
}
