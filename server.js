// server.js
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const jwt = require("jsonwebtoken");
const CookieParser = require("cookie-parser");
server.use(middlewares);
server.use(CookieParser());
const testUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin",
    role: "admin",
  },
  {
    id: 2,
    username: "user",
    password: "user",
    role: "user",
  },
];
server.use("/api", router);
server.use(jsonServer.bodyParser);

//custom auth routes
server.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  const user = testUsers.find(
    (user) => user.username === username && user.password === password
  );
  if (!user) {
    return res.json({ error: "Invalid username or password" });
  }
  const token = jwt.sign(
    { username: user.username, role: user.role },
    "MY_SECRET_KEY"
  );
  res.cookie("token", token, { httpOnly: true }).json({ token: token });
});

server.get("/protected", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ error: "Not authorized" });
  }
  try {
    const data = jwt.verify(token, "MY_SECRET_KEY");
    if (!data) {
      return res.json({ error: "Not authorized" });
    }
    res.json({ success: "You are authorized" });
  } catch {
    res.json({ error: "Not authorized" });
  }
});
server.post("/register", (req, res) => {
  const { username, password, role } = req.query;
  const user = testUsers.find((user) => user.username === username);
  if (user) {
    return res.json({ error: "User already exists" });
  }
  const newUser = {
    id: testUsers.length + 1,
    username,
    password,
    role,
  };
  testUsers.push(newUser);
  res.json({ success: "User created" });
});

server.listen(3000, () => {
  console.log("JSON Server is running");
});
