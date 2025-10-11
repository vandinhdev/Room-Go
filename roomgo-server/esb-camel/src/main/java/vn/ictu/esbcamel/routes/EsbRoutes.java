package vn.ictu.esbcamel.routes;

import lombok.RequiredArgsConstructor;
import org.apache.camel.Exchange;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.model.rest.RestBindingMode;
import org.springframework.stereotype.Component;
import org.apache.camel.model.dataformat.JsonLibrary;
import vn.ictu.esbcamel.processor.JwtProcessor;

@Component
@RequiredArgsConstructor
public class EsbRoutes extends RouteBuilder {
    private final JwtProcessor jwtProcessor;


    @Override
    public void configure() throws Exception {

        // Config cho REST DSL
        restConfiguration()
                .component("servlet") // Sử dụng Servlet để lắng nghe các yêu cầu HTTP
                .contextPath("/api/esb")   // FE gọi: http://localhost:8080/api/esb/...
                .port(8080)
                .bindingMode(RestBindingMode.json);

        // ================== AUTH SERVICE ==================
        rest("/auth")
                .post("/login").to("direct:login")
                .post("/register").to("direct:register")
                .post("/refresh-token").to("direct:refresh")
                .get("/verify-email").to("direct:verify");



        // ---------- AUTH ----------
        from("direct:login")
                .routeId("login-route")
                .log("👉 [ESB] Forwarding login via Eureka: ${body}")
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)

                // Gọi qua Eureka (Camel tự lookup IP + port từ registry)
                .serviceCall()
                .name("USER-MANAGEMENT-SERVICE")
                .expression().simple("/api/user/auth/login")
                .loadBalancer("roundrobin")       // cân bằng tải (nếu nhiều instance)
                .serviceFilter("healthy")         // chỉ chọn service đang UP
                .end()

                .log("✅ [ESB] Response from user-management-service: ${body}")
                .unmarshal().json(JsonLibrary.Jackson);


//        from("direct:register")
//                .routeId("register-route")
//                .log("👉 [ESB] Forwarding register: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .serviceCall("user-management-service/api/user/auth/register?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:refresh")
//                .routeId("refresh-route")
//                .log("👉 [ESB] Forwarding refresh token")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .serviceCall("user-management-service/api/user/auth/refresh-token?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);

//                .unmarshal().json(JsonLibrary.Jackson);
//
//        // ================== USER SERVICE ==================
//        rest("/user")
//                .get("/list").to("direct:user-list")
//                .get("/detail/{userId}").to("direct:user-detail")
//                .get("/by-email").to("direct:user-by-email")
//                .get("/profile").to("direct:user-profile")
//                .post("/add").to("direct:user-add")
//                .put("/update-profile").to("direct:user-update")
//                .delete("/delete/{userId}").to("direct:user-delete")
//                .patch("/change-pwd").to("direct:user-change-pwd")
//                .post("/forgot-password").to("direct:user-forgot-pwd")
//                .post("/reset-password").to("direct:user-reset-pwd");
//
//        // ---------- USER ----------
//        from("direct:user-list")
//                .routeId("user-list-route")
//                .log("👉 [ESB] Forwarding get user list")
//                .to("http://user-management-service:8080/api/user/list?httpMethod=GET&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-detail")
//                .routeId("user-detail-route")
//                .log("👉 [ESB] Forwarding get user detail: ${header.userId}")
//                .toD("http://user-management-service:8080/api/user/detail/${header.userId}?httpMethod=GET&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-by-email")
//                .routeId("user-by-email-route")
//                .log("👉 [ESB] Forwarding get user by email: ${header.email}")
//                .toD("http://user-management-service:8080/api/user/by-email?email=${header.email}&httpMethod=GET&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-profile")
//                .routeId("user-profile-route")
//                .log("👉 [ESB] Forwarding get profile")
//                .to("http://user-management-service:8080/api/user/me?httpMethod=GET&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-add")
//                .routeId("user-add-route")
//                .log("👉 [ESB] Forwarding create user: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://user-management-service:8080/api/user/add?httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-update")
//                .routeId("user-update-route")
//                .log("👉 [ESB] Forwarding update user profile: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://user-management-service:8080/api/user/update-profile?httpMethod=PUT&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-delete")
//                .routeId("user-delete-route")
//                .log("👉 [ESB] Forwarding delete user: ${header.userId}")
//                .toD("http://user-management-service:8080/api/user/delete/${header.userId}?httpMethod=DELETE&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-change-pwd")
//                .routeId("user-change-pwd-route")
//                .log("👉 [ESB] Forwarding change password: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://user-management-service:8080/api/user/change-pwd?httpMethod=PATCH&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-forgot-pwd")
//                .routeId("user-forgot-pwd-route")
//                .log("👉 [ESB] Forwarding forgot password: ${header.email}")
//                .toD("http://user-management-service:8080/api/user/forgot-password?email=${header.email}&httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:user-reset-pwd")
//                .routeId("user-reset-pwd-route")
//                .log("👉 [ESB] Forwarding reset password: ${header.email}, otp=${header.otp}")
//                .toD("http://user-management-service:8080/api/user/reset-password?email=${header.email}&otp=${header.otp}&newPassword=${header.newPassword}&httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//
//
//
//        // ================== ROOM SERVICE ==================
//        rest("/room")
//                .get("/list").to("direct:room-list")
//                .get("/detail/{id}").to("direct:room-detail")
//                .get("/me").to("direct:room-me") // Gọi lại room-list nhưng có JWT
//                .post("/add").to("direct:room-add")
//                .put("/update").to("direct:room-update")
//                .delete("/delete/{id}").to("direct:room-delete")
//                .post("/favorite/{roomId}").to("direct:favorite-add")
//                .delete("/favorite/remove/{roomId}").to("direct:favorite-remove")
//                .get("/favorite/me").to("direct:favorite-me");
//
//        from("direct:room-list")
//                .routeId("room-list-route")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding get room list")
//                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
//                .to("http://room-management-service:8080/api/room/list?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:room-detail")
//                .routeId("room-detail-route")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding get room detail id=${header.id}")
//                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
//                .toD("http://room-management-service:8080/api/room/detail/${header.id}?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//        from("direct:room-me")
//                .routeId("room-me-route")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding get my rooms")
//                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
//                .to("http://room-management-service:8080/api/room/me?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:room-add")
//                .routeId("room-add-route")
//                .log("Processing JWT for room-add")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding create room: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://room-management-service:8080/api/room/add?httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:room-update")
//                .routeId("room-update-route")
//                .log("Processing JWT for room-update")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding update room: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://room-management-service:8080/api/room/update?httpMethod=PUT&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:room-delete")
//                .routeId("room-delete-route")
//                .log("Processing JWT for room-delete")
//                .log("👉 [ESB] Forwarding delete room id=${header.id}")
//                .setHeader(Exchange.HTTP_METHOD, constant("DELETE"))
//                .toD("http://room-management-service:8080/api/room/delete/${header.id}?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        // ---------- FAVORITE ROOM ----------
//        from("direct:favorite-add")
//                .routeId("favorite-add-route")
//                .log("Processing JWT for favorite-add")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding add favorite room id=${header.roomId}")
//                .setHeader(Exchange.HTTP_METHOD, constant("POST"))
//                .toD("http://room-management-service:8080/api/favorite-rooms/${header.roomId}?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//        from("direct:favorite-remove")
//                .routeId("favorite-remove-route")
//                .log("Processing JWT for favorite-remove")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding remove favorite room id=${header.roomId}")
//                .setHeader(Exchange.HTTP_METHOD, constant("DELETE"))
//                .toD("http://room-management-service:8080/api/favorite-rooms/remove/${header.roomId}?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:favorite-me")
//                .routeId("favorite-me-route")
//                .log("Processing JWT for favorite-me")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding get my favorite rooms")
//                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
//                .to("http://room-management-service:8080/api/favorite-rooms/me?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//
//        // ================== COMMUNICATION SERVICE ==================
//        rest("/comm")
//                .get("/get-user-conversations").to("direct:get-user-conversations")
//                .get("/search-by-conversation-name").to("direct:search-by-conversation-name")
//                .get("/conversations/{conversationId}").to("direct:get-conversation-by-id")
//                .post("/add-conversations").to("direct:add-conversations")
//                .post("/send-message").to("direct:send-message")
//                .delete("/delete-conversation/{conversationId}").to("direct:delete-conversation")
//                .post("/send-verification").to("direct:send-verification")
//                .post("/send-reset-password").to("direct:send-reset-password");
//
//
//        from("direct:get-user-conversations")
//                .routeId("get-user-conversations-route")
//                .log("Processing JWT for get-user-conversations")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .setHeader("Authorization", header("Authorization"))
//                .log("👉 [ESB] Forwarding get user conversations")
//                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
//                .to("http://communication-service:8080/api/chats/get-user-conversations?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:search-by-conversation-name")
//                .routeId("search-by-conversation-name-route")
//                .log("Processing JWT for search-by-conversation-name")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding search by conversation name: ${header.name}")
//                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
//                .toD("http://communication-service:8080/api/chats/search-by-conversation-name?name=${header.name}&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:get-conversation-by-id")
//                .routeId("get-conversation-by-id-route")
//                .log("Processing JWT for get-conversation-by-id")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding get conversation by id: ${header.con   versationId}")
//                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
//                .toD("http://communication-service:8080/api/chats/conversations/${header.conversationId}?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:add-conversations")
//                .routeId("add-conversations-route")
//                .log("Processing JWT for add-conversations")
//                .process(jwtProcessor)// Xác thực JWT trước khi gọi dịch vụ phòng
//                .setHeader("Authorization", header("Authorization"))
//                .log("👉 [ESB] Forwarding add conversation: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://communication-service:8080/api/chats/add-conversations?httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:send-message")
//                .routeId("send-message-route")
//                .log("Processing JWT for send-message")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .setHeader("Authorization", header("Authorization"))
//                .log("👉 [ESB] Forwarding send message: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://communication-service:8080/api/chats/send-message?httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:delete-conversation")
//                .routeId("delete-conversation-route")
//                .log("Processing JWT for delete-conversation")
//                .process(jwtProcessor) // Xác thực JWT trước khi gọi dịch vụ phòng
//                .log("👉 [ESB] Forwarding delete conversation id=${header.conversationId}")
//                .setHeader(Exchange.HTTP_METHOD, constant("DELETE"))
//                .toD("http://communication-service:8080/api/chats/delete-conversation/${header.conversationId}?bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        // ---------- Gửi email ----------
//        from("direct:send-verification")
//                .routeId("send-verification-route")
//                .log("👉 [ESB] Forwarding send verification email: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://communication-service:8080/api/email/send-verification?httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);
//
//        from("direct:send-reset-password")
//                .routeId("send-reset-password-route")
//                .log("👉 [ESB] Forwarding send reset password email: ${body}")
//                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
//                .marshal().json(JsonLibrary.Jackson)
//                .to("http://communication-service:8080/api/email/send-reset-password?httpMethod=POST&bridgeEndpoint=true")
//                .unmarshal().json(JsonLibrary.Jackson);

    }

}
