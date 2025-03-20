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
RUN apk update && apk add --no-cache wget

# 创建必要的目录
RUN mkdir -p /etc/nginx/conf.d

# 复制构建产物和配置文件
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]

 