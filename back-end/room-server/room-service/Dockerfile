FROM openjdk:17-jdk-slim

ARG JAR_FILE=target/*.jar

COPY ${JAR_FILE} room-service.jar

ENTRYPOINT ["java", "-jar", "room-service.jar"]

EXPOSE 8082
