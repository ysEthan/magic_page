# Build stage
FROM node:18-alpine as build-stage

WORKDIR /app

# 使用国内镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:1.24.0-alpine

# 创建必要的目录
RUN mkdir -p /etc/nginx/conf.d





# 复制构建产物和配置文件
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

