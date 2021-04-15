const express = require("express");
const cors = require("cors");
const bodyParse = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const socket = require("socket.io");

const TOKEN = require("crypto").randomBytes(64).toString("hex");
function generateAccessToken(username) {
  let jwToken = jwt.sign({ username }, TOKEN);
  users = users.map((i) => {
    if (i.username == username) return { ...i, jwt: jwToken };
    return i;
  });
  console.log();
  return {
    jwt: jwToken,
    username: username,
  };
}

const app = express();
app.use(cors());
app.use(bodyParse.json());

let users = [{ username: "Julian", password: "123456" }];

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, TOKEN, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });
};
app.get("/", (req, res) => res.send("Bienvenido"));
app.post("/authenticate", (req, res) => {
  const { token } = req.headers;
  if (token === undefined)
    return res.status(500).send({ error: "No jwt supplied" });
  jwt.verify(token, TOKEN, (err, user) => {
    if (err) return res.status(500).send({ error: "No jwt supplied" });
    res.send({
      auth: true,
      username: users.find((i) => i.jwt == token)?.username,
    });
  });
});

app.post("/login", ({ body: { username, password } }, res) => {
  const user = users.find((i) => i.username == username);
  if (user === undefined)
    return res.status(400).send({ error: "Invalid username or password" });
  bcrypt.compare(password, user.password, (err, result) => {
    if (!result || err)
      return res.status(400).send({ error: "invalid username or password" });
    const token = generateAccessToken(username);
    res.status(200).json({ jwt: token.jwt, username: token.username });
  });
});

app.get("/users", (req, res) => {
  verifyToken(req.headers.token)
    .then((user) => {
      res.send(users.map((i) => i.username));
    })
    .catch((err) => res.status(500).send(err));
});

app.post("/create_user", ({ body: { username, password } }, res) => {
  if (users.find((i) => i.username == username))
    return res.status(500).send({ error: "Usuario existente" });
  bcrypt.hash(password, 10, (err, hashedPass) => {
    users.push({ username, password: hashedPass });
    const { jwt } = generateAccessToken(username);
    console.log(username, password);
    res.send({ message: "User created", created: true, jwt, username });
  });
});

const server = app.listen(4000, (err) => {
  if (err) console.log(err);
  console.log("Connected to port 4000");
});

const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", function (socket) {
  console.log("Made conection");
  socket.on("join room", ({ uid }) => {
    socket.join(uid);
  });
  socket.on("chat", ({ username, text, uid }) => {
    console.log(username, text, uid);
    io.to(uid).emit("chat", { username, text });
  });
  socket.on("create room", (uid) => {
    console.log(uid);
    socket.join(uid);
  });
  socket.on("disconnect", () => {
    io.emit("user disconnected", socket.userId);
  });
});
