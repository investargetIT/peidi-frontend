# 基本操作
1.构建镜像
```
./build.sh
```
2.运行容器
```
./run.sh
```
3.生成静态页面
```
docker exec peidi-frontend npm run generate
```

# 钉钉免登 APITable
路由`/peidi/dd`实现了钉钉免登，访问该页面会获取当前钉钉用户企业邮箱，然后自动登录或注册 APITable。登录或注册成功后会自动跳转到实际需要使用的 APITable 页面
## 使用
1. 确定 APITable 的域名
1. 确定需要跳转的路由，譬如 `/share/shrQc3ZDaTXz8ElLz12uD`
2. 将该路由 Encode 一下，得到 `%2Fshare%2FshrQc3ZDaTXz8ElLz12uD`（这里就是把斜杠替换成了%2F）
3. 域名 + `/peidi/dd?redirect_uri=%2Fshare%2FshrQy3ZDaTXz8ElLz12uD` 就是钉钉应用的首页地址

## 实现
通过 NGINX 将 `/peidi/dd` 这个路由代理到 APITable 的域名下
```
location ~ /(peidi|_nuxt)/ {
    root /media/www/planet;
    try_files $uri $uri/ =404;
}
```
