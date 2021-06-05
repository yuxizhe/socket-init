const Koa = require("koa");
const fs = require("fs");
const Router = require("koa-router");
const static = require("koa-static");

const app = new Koa();
const server = require("http").createServer(app.callback());
const SocketIO = require("socket.io");

// TODO: 多个路由时？
const io = SocketIO(server, { origins: "*:*" });

app.use(static("public"));

// 路由
// const router = new Router();
// router.get("/", (ctx) => {
// });
// app.use(router.routes());

// socket连接

// 连接中间件 日志/鉴权，每次连接只执行一次
io.use((socket, next) => {
  // handshake参数
  const username = socket.handshake.auth.username;
  console.log("username", username);
  if (!username) {
    return next(new Error("invalid username"));
  }
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
  // 登录处理
  // 发送给当前用户
  socket.emit("user connect", { message: "connected" });
  // 发送用户列表
  let users = getUsers();
  // 广播
  io.emit("users", users);

  // 处理聊天信息
  socket.on("chat message", (msg) => {
    console.log(`message: ${msg}`);
    io.emit("chat message", msg);
  });

  // 处理私聊信息
  socket.on("private message", ({ msg, to }) => {
    console.log(`private message: ${msg}`);
    socket.to(to).emit("private message", {
      msg,
      from: socket.id,
    });
  });

  socket.on("subscribe", (msg) => {
    console.log(`subscribe: ${msg}`);
    io.emit("subscribe", msg);
  });

  // 处理断开连接消息
  socket.on("disconnect", () => {
    users = getUsers();
    // 广播状态
    io.emit("users", users);
  });
});

// 监听端口
server.listen(3001, () => {
  console.log("listening on *:3001");
});
