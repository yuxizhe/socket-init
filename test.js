const Koa = require('koa');

const app = new Koa();
const Router = require('koa-router');
const fs = require('fs');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, { origins: '*:*' });

// 首页路由
const router = new Router();
router.get('/', (ctx) => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream('./index.html');
});
app.use(router.routes());


// socket连接
io.on('connect', (socket) => {
  console.log('connect');
  socket.emit('an event', { some: 'data' });
  socket.on('chat message', (msg) => {
    console.log(`message: ${msg}`);
    socket.emit('chat message', msg);
  });
  socket.on('subscribe', (msg) => {
    console.log(`message: ${msg}`);
    socket.emit('subscribe', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('event', (data) => {
    console.log(data);
  });
});

// 监听端口
server.listen(3000, () => {
  console.log('listening on *:3000');
});
