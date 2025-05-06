import { db } from "./db.mjs";

// 유저 전체 조회
export async function getUsers() {
  const [rows] = await db.query("SELECT * FROM users");
  return rows;
}

// 회원가입
export async function createUser(userid, userpw, name, email) {
  const [result] = await db.query(
    "INSERT INTO users (userid, userpw, name, email) VALUES (?, ?, ?, ?)",
    [userid, userpw, name, email]
  );
  return result.insertId;
}

//게시글 주인 확인
export async function getTodoById(idx) {
  const [rows] = await db.query("SELECT * FROM todos WHERE idx=?", [idx]);
  return rows[0];
}

// 전체 할 일 조회
export async function getAllTodos() {
  const [rows] = await db.query("SELECT * FROM todos ORDER BY idx DESC");
  return rows;
}
// 할 일 수정
export async function updateTodo(idx, dos) {
  const [result] = await db.query("UPDATE todos SET dos=? WHERE idx=?", [
    dos,
    idx,
  ]);
  return result.affectedRows > 0;
}

// 할 일 삭제
export async function deleteTodo(idx) {
  const [result] = await db.query("DELETE FROM todos WHERE idx=?", [idx]);
  return result.affectedRows > 0;
}

//할일 생성
export async function createTodo(userid, dos) {
  const [result] = await db.query(
    "INSERT INTO todos (userid, dos) VALUES (?, ?)",
    [userid, dos]
  );
  return result.insertId;
}
