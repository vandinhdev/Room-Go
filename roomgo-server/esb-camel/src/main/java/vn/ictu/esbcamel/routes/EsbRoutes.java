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

        restConfiguration()
                .component("platform-http")
                .contextPath("/api/esb")
                .bindingMode(RestBindingMode.json)
                .corsHeaderProperty("Access-Control-Allow-Origin", "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:3000,http://localhost:3000")
                .corsHeaderProperty("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
                .corsHeaderProperty("Access-Control-Allow-Headers", "*")
                .corsHeaderProperty("Access-Control-Allow-Credentials", "true")
                .corsHeaderProperty("Access-Control-Max-Age", "3600");

        rest("/auth")
                .post("/login").to("direct:login")
                .post("/register").to("direct:register")
                .post("/refresh-token").to("direct:refresh")
                .post("/guest-token").to("direct:guestToken");

        from("direct:login")
                .routeId("login-route")
                .log("👉 [ESB] Forwarding login: ${body}")
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/auth/login?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:register")
                .routeId("register-route")
                .log("👉 [ESB] Forwarding register: ${body}")
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/auth/register?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:refresh")
                .routeId("refresh-token-route")
                .log("👉 [ESB] Forwarding refresh token: ${body}")
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/auth/refresh-token?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:guestToken")
                .routeId("guest-token-route")
                .log("👉 [ESB] Forwarding guest token request")
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://user-management-service:8080/api/user/auth/guest-token?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        // User routes
        rest("/user")
                .get("/list").to("direct:getUserList")
                .get("/{userId}").to("direct:getUserById")
                .get("/email").to("direct:getUserByEmail")
                .get("/profile").to("direct:getUserProfile")
                .put("/update-status/{id}").to("direct:updateUserStatus")
                .put("/update-profile").to("direct:updateUserProfile")
                .post("/upload-avatar").to("direct:uploadUserAvatar")
                .delete("/{id}").to("direct:deleteUser")
                .patch("/change-password").to("direct:changePassword")
                .post("/forgot-password").to("direct:forgotPassword")
                .post("/reset-password").to("direct:resetPassword");

        from("direct:getUserList")
                .routeId("get-user-list-route")
                .log("👉 [ESB] Forwarding get user list request")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://user-management-service:8080/api/user/list?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:getUserById")
                .routeId("get-user-by-id-route")
                .log("👉 [ESB] Forwarding get user by id request: ${header.userId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://user-management-service:8080/api/user/${header.userId}?bridgeEndpoint=true&httpMethod=GET")
                .log("Header after toD: ${headers.userId}")
                .unmarshal().json(JsonLibrary.Jackson)
                .log("Body after unmarshal: ${body}");


        from("direct:getUserByEmail")
                .routeId("get-user-by-email-route")
                .log("👉 [ESB] Forwarding get user by email request: ${header.email}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://user-management-service:8080/api/user/email?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:getUserProfile")
                .routeId("get-user-profile-route")
                .log("👉 [ESB] Forwarding get user profile request")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://user-management-service:8080/api/user/profile?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:updateUserStatus")
                .routeId("update-user-status-route")
                .log("👉 [ESB] Forwarding update user status request: ${header.userId} with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .toD("http://user-management-service:8080/api/user/update-status/${header.userId}?bridgeEndpoint=true&httpMethod=PUT")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:updateUserProfile")
                .routeId("update-user-profile-route")
                .log("👉 [ESB] Forwarding update user profile request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/update-profile?bridgeEndpoint=true&httpMethod=PUT")
                .unmarshal().json(JsonLibrary.Jackson);
        from("direct:uploadUserAvatar")
                .routeId("upload-user-avatar-route")
                .log("👉 [ESB] Forwarding upload user avatar request")
                .process(jwtProcessor)
                // ❌ KHÔNG xóa header Content-Type (vì chứa boundary)
                // ❌ KHÔNG tự set Content-Type bằng tay
                .setHeader(Exchange.HTTP_METHOD, constant("POST"))
                .removeHeader("CamelHttpUri")             // optional - tránh conflict khi forward
                .removeHeader("CamelHttpPath")            // optional
                .to("http://user-management-service:8080/api/user/upload-avatar?bridgeEndpoint=true&throwExceptionOnFailure=false")
                .log("✅ [ESB] Upload avatar forwarded successfully");


        from("direct:deleteUser")
                .routeId("delete-user-route")
                .log("👉 [ESB] Forwarding delete user request: ${header.userId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://user-management-service:8080/api/user/delete/${header.userId}?bridgeEndpoint=true&httpMethod=DELETE")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:changePassword")
                .routeId("change-password-route")
                .log("👉 [ESB] Forwarding change password request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/password/change-password?bridgeEndpoint=true&httpMethod=PATCH")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:forgotPassword")
                .routeId("forgot-password-route")
                .log("👉 [ESB] Forwarding forgot password request: ${body}")
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/forgot-password?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:resetPassword")
                .routeId("reset-password-route")
                .log("👉 [ESB] Forwarding reset password request with body: ${body}")
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/reset-password?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        //room routes
        rest("/room")
                .get("/list").to("direct:getRoomList")
                .get("/{roomId}").to("direct:getRoomById")
                .get("/me").to("direct:getRoomMe")
                .post("/search-history").to("direct:searchRoomHistory")
                .post("/add").to("direct:addRoom")
                .put("/update").to("direct:updateRoom")
                .delete("/delete/{roomId}").to("direct:deleteRoom");

        from("direct:getRoomList")
                .routeId("get-room-list-route")
                .log("👉 [ESB] Forwarding get room list request")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://room-management-service:8080/api/room/list?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:getRoomById")
                .routeId("get-room-by-id-route")
                .log("👉 [ESB] Forwarding get room by id request: ${header.roomId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://room-management-service:8080/api/room/detail/${header.roomId}?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:getRoomMe")
                .routeId("get-room-me-route")
                .log("👉 [ESB] Forwarding get room me request")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://room-management-service:8080/api/room/me?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:searchRoomHistory")
                .routeId("search-room-history-route")
                .log("👉 [ESB] Forwarding search room history request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://room-management-service:8080/api/room/search-history?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:addRoom")
                .routeId("add-room-route")
                .log("👉 [ESB] Forwarding add room request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://room-management-service:8080/api/room/add?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:updateRoom")
                .routeId("update-room-route")
                .log("👉 [ESB] Forwarding update room request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://room-management-service:8080/api/room/update?bridgeEndpoint=true&httpMethod=PUT")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:deleteRoom")
                .routeId("delete-room-route")
                .log("👉 [ESB] Forwarding delete room request: ${header.roomId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://room-management-service:8080/api/room/delete/${header.roomId}?bridgeEndpoint=true&httpMethod=DELETE")
                .unmarshal().json(JsonLibrary.Jackson);

        // favorite room routes
        rest("/favorite-rooms")
                .get("/me").to("direct:getFavoriteRoomsByUserEmail")
                .post("/{roomId}").to("direct:addFavoriteRoom")
                .delete("/remove/{roomId}").to("direct:removeFavoriteRoom");

        from("direct:getFavoriteRoomsByUserEmail")
                .routeId("get-favorite-rooms-by-user-email-route")
                .log("👉 [ESB] Forwarding get favorite rooms by user email request")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://room-management-service:8080/api/favorite-rooms/me?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:addFavoriteRoom")
                .routeId("add-favorite-room-route")
                .log("👉 [ESB] Forwarding add favorite room request: ${header.roomId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://room-management-service:8080/api/favorite-rooms/${header.roomId}?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:removeFavoriteRoom")
                .routeId("remove-favorite-room-route")
                .log("👉 [ESB] Forwarding remove favorite room request: ${header.roomId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://room-management-service:8080/api/favorite-rooms/remove/${header.roomId}?bridgeEndpoint=true&httpMethod=DELETE")
                .unmarshal().json(JsonLibrary.Jackson);



    }
}