# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制依赖文件
COPY package*.json ./

# 清理并安装依赖
RUN rm -rf node_modules .vite dist && npm install

# 复制源代码
COPY . .

# 构建
RUN npm run build

# Production stage
FROM nginx:1.24.0-alpine

# 使用阿里云镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装基础工具
RUN apk update && apk add --no-cache curl wget gettext

# 创建必要的目录
RUN mkdir -p /etc/nginx/conf.d

# 复制构建产物和配置文件
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/templates/default.conf.template
COPY .env.example /app/.env.example

# 创建启动脚本
COPY <<'EOF' /docker-entrypoint.sh
#!/bin/sh
set -e

# 如果没有 .env 文件，使用 .env.example
if [ ! -f /app/.env ]; then
    echo "No .env file found, using .env.example as default"
    cp /app/.env.example /app/.env
fi

# 加载环境变量
export $(cat /app/.env | grep -v '^#' | xargs)

# 使用环境变量替换nginx配置
envsubst '${NGINX_SERVER_PORT} ${NGINX_SERVER_NAME} ${NGINX_API_PROXY_PASS} ${NGINX_CORS_ALLOW_ORIGIN} ${NGINX_CORS_ALLOW_METHODS} ${NGINX_CORS_ALLOW_HEADERS}' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf

# 启动nginx
exec nginx -g 'daemon off;'
EOF

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:${NGINX_SERVER_PORT} || exit 1

CMD ["/docker-entrypoint.sh"]

 