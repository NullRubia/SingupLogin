import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.host.port;
const SECRET_KEY = config.jwt.secretKey;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = []; //사용자 회원가입 정보 저장

//signup페이지 보내기
app.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, "signup.html"), (err, data) => {
    if (err) {
      console.error("signup.html 읽기 오류:", err.message);
      res.status(500).send("파일 읽기 오류");
      return;
    }
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

//signup 처리
app.post("/signup", async (req, res) => {
  const { userid, name, passwd, email } = req.body;

  const hashedPassword = await bcrypt.hash(passwd + SECRET_KEY, 10);
  users.push({ userid, name, email, password: hashedPassword });

  res.redirect("/login");
});

//login페이지 보내기
app.get("/login", (req, res) => {
  fs.readFile(path.join(__dirname, "login.html"), (err, data) => {
    if (err) return res.status(500).send("파일 읽기 오류");
    res.status(200).set({ "Content-Type": "text/html" }).send(data);
  });
});

//login 처리
app.post("/login", async (req, res) => {
  const { userid, passwd } = req.body;
  const user = users.find((u) => u.userid === userid);

  if (!user) {
    return res.send(`
      <script>
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        window.location.href = '/login';
      </script>
    `);
  }

  const isMatch = await bcrypt.compare(passwd + SECRET_KEY, user.password);

  if (!isMatch) {
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

  res.redirect(`/result?userid=${user.userid}&token=${token}`);
});

//결과 출력
app.get("/result", (req, res) => {
  const { userid, token } = req.query;

  fs.readFile(path.join(__dirname, "result.html"), "utf-8", (err, data) => {
    if (err) return res.status(500).send("파일 읽기 오류");

    const updatedHtml = data
      .replace("{{userid}}", userid)
      .replace("{{token}}", token);

    res.status(200).set({ "Content-Type": "text/html" }).send(updatedHtml);
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행 중`);
});
