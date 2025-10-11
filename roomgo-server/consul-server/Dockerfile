FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Mặc định có thể override bằng docker-compose.yml
ENV SPRING_PROFILES_ACTIVE=dev
ENV SPRING_CLOUD_CONSUL_HOST=consul-server
ENV SPRING_CLOUD_CONSUL_PORT=8500

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
