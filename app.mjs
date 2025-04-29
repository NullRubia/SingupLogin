import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.mjs";
import { posts } from "./post.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.host.port;
const SECRET_KEY = config.jwt.secretKey;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

let users = [];

// signup 페이지 넘겨주기
app.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, "signup.html"), (err, data) => {
    if (err) return res.status(500).send("파일 읽기 오류");
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

// singup 처리
app.post("/signup", async (req, res) => {
  const { userid, name, passwd, email } = req.body;
  const hashedPassword = await bcrypt.hash(passwd + SECRET_KEY, 10);
  users.push({ userid, name, email, password: hashedPassword });
  res.redirect("/login");
});

// login 페이지 넘겨주기
app.get("/login", (req, res) => {
  fs.readFile(path.join(__dirname, "login.html"), (err, data) => {
    if (err) return res.status(500).send("파일 읽기 오류");
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

// login 처리 및 JWT 발급
app.post("/login", async (req, res) => {
  const { userid, passwd } = req.body;
  const user = users.find((u) => u.userid === userid);

  if (!user || !(await bcrypt.compare(passwd + SECRET_KEY, user.password))) {
    return res.send(`
      <script>
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        window.location.href = '/login';
      </script>
    `);
  }

  const token = jwt.sign({ userid: user.userid }, SECRET_KEY, {
    expiresIn: config.jwt.expiresInSec,
  });

  res.send(`
    <script>
      alert('로그인 성공!');
      localStorage.setItem('token', '${token}');
      window.location.href = '/login';
    </script>
  `);
});

// post 페이지 (JWT 인증 필수)
app.get("/posts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("인증 오류: 토큰이 없습니다.");
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, SECRET_KEY);
    fs.readFile(path.join(__dirname, "post.html"), (err, data) => {
      if (err) return res.status(500).send("파일 읽기 오류");
      res.status(200).set({ "Content-Type": "text/html" }).send(data);
    });
  } catch (err) {
    res.status(403).send("유효하지 않은 토큰입니다.");
  }
});

// post JSON API
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

app.listen(PORT, () => {
  console.log(`서버 실행 중`);
});
