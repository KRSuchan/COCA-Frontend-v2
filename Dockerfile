# 1단계: Build React
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# 2단계: Serve with nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/build .

# ✅ 너의 커스텀 nginx.conf 복사
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]