## KOA & Socket IO

KOA & Socket IO

## debug模式启动
```
npm run debug
```
或者
```
pm2 start npm -- run debug
```
## nginx 设置

需要增加设置才能转发 websocket
如下：
```nginx
location = / {
  proxy_pass localhost:3001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```
