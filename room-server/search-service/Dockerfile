FROM openjdk:17-jdk-slim

ARG JAR_FILE=target/*.jar

COPY ${JAR_FILE} search-service.jar

ENTRYPOINT ["java", "-jar", "search-service.jar"]

EXPOSE 8084
