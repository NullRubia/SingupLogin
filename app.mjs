import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.mjs";
import {
  getUsers,
  createUser,
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
} from "./todosRepository.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = config.host.port;
const SECRET_KEY = config.jwt.secretKey;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 회원가입 페이지
app.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, "signup.html"), (err, data) => {
    if (err) return res.status(500).send("파일 오류");
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

app.get("/login", (req, res) => {
  fs.readFile(path.join(__dirname, "login.html"), (err, data) => {
    if (err) return res.status(500).send("파일 오류");
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

app.get("/signup", (req, res) => {
  fs.readFile(path.join(__dirname, "signup.html"), (err, data) => {
    if (err) return res.status(500).send("파일 오류");
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

// 회원가입
app.post("/signup", async (req, res) => {
  const { userid, passwd, name, email } = req.body;
  const hashed = await bcrypt.hash(passwd + SECRET_KEY, 10);
  await createUser(userid, hashed, name, email);
  res.send(`<script>alert('회원가입 완료'); location.href='/login';</script>`);
});

// 로그인
app.post("/login", async (req, res) => {
  const { userid, passwd } = req.body;
  const users = await getUsers();
  const user = users.find((u) => u.userid === userid);
  if (!user)
    return res.send(
      `<script>alert('존재하지 않는 아이디'); location.href='/login';</script>`
    );

  const isMatch = await bcrypt.compare(passwd + SECRET_KEY, user.userpw);
  if (!isMatch)
    return res.send(
      `<script>alert('비밀번호 오류'); location.href='/login';</script>`
    );

  const token = jwt.sign({ userid }, SECRET_KEY, {
    expiresIn: config.jwt.expiresInSec,
  });
  res.send(
    `<script>alert('로그인 성공'); localStorage.setItem('token', '${token}'); location.href='/todos';</script>`
  );
});

// todos 페이지
app.get("/todos", (req, res) => {
  fs.readFile(path.join(__dirname, "todos.html"), (err, data) => {
    if (err) return res.status(500).send("todos.html 오류");
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

// 전체 할일 조회
app.get("/api/todos", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    jwt.verify(token, SECRET_KEY);
    const todos = await getAllTodos();
    res.json(todos);
  } catch {
    res.status(401).send("인증 오류");
  }
});

// 할일 추가
app.post("/api/todos", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { userid } = jwt.verify(token, SECRET_KEY);
    const { dos } = req.body;
    const id = await createTodo(userid, dos);
    res.json({ idx: id });
  } catch {
    res.status(401).send("인증 오류");
  }
});

// 수정
app.put("/api/todos/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { userid } = jwt.verify(token, SECRET_KEY);
    const todo = await getTodoById(req.params.id);
    if (!todo || todo.userid !== userid)
      return res.status(403).send("권한 없음");

    const { dos } = req.body;
    const result = await updateTodo(req.params.id, dos);
    res.sendStatus(result ? 200 : 404);
  } catch {
    res.status(401).send("인증 오류");
  }
});

// 삭제
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { userid } = jwt.verify(token, SECRET_KEY);
    const todo = await getTodoById(req.params.id);
    if (!todo || todo.userid !== userid)
      return res.status(403).send("권한 없음");

    const result = await deleteTodo(req.params.id);
    res.sendStatus(result ? 200 : 404);
  } catch {
    res.status(401).send("인증 오류");
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
