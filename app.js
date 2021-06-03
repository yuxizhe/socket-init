const Koa = require("koa");
const fs = require("fs");
const Router = require("koa-router");
const static = require("koa-static");

const app = new Koa();
const server = require("http").createServer(app.callback());
const SocketIO = require("socket.io");

const io = SocketIO(server, { origins: "*:*" });

app.use(static("public"));

// 路由
// const router = new Router();
// router.get("/", (ctx) => {
// });
// app.use(router.routes());

// socket连接

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  console.log("username", username);
  socket.username = username;
  next();
});

/**
 * 获取当前所有用户
 * @returns users 用户列表
 */
function getUsers() {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
  }
  return users;
}

io.on("connect", (socket) => {
  console.log("connect");
  socket.emit("an event", { message: "connected" });

  // 发送用户列表
  let users = getUsers();
  io.emit("users", users);

  socket.on("chat message", (msg) => {
    console.log(`message: ${msg}`);
    io.emit("chat message", msg);
  });

  socket.on("subscribe", (msg) => {
    console.log(`subscribe: ${msg}`);
    io.emit("subscribe", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    users = getUsers();
    io.emit("users", users);
  });
});

// 监听端口
server.listen(3001, () => {
  console.log("listening on *:3001");
});
