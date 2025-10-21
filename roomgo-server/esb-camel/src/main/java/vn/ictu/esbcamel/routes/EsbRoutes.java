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
                .put("update-avatar").to("direct:updateUserAvatar")
                .put("update-email").to("direct:updateUserEmail")
                .put("update-phone").to("direct:updateUserPhone")
                .post("/upload-avatar").to("direct:uploadUserAvatar")
                .delete("delete/{userId}").to("direct:deleteUser")
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

        from("direct:updateUserAvatar")
                .routeId("update-user-avatar-route")
                .log("👉 [ESB] Forwarding update user avatar request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/update-avatar?bridgeEndpoint=true&httpMethod=PUT")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:updateUserEmail")
                .routeId("update-user-email-route")
                .log("👉 [ESB] Forwarding update user email request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/update-email?bridgeEndpoint=true&httpMethod=PUT")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:updateUserPhone")
                .routeId("update-user-phone-route")
                .log("👉 [ESB] Forwarding update user phone request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://user-management-service:8080/api/user/update-phone?bridgeEndpoint=true&httpMethod=PUT")
                .unmarshal().json(JsonLibrary.Jackson);


        from("direct:uploadUserAvatar")
                .routeId("upload-user-avatar-route")
                .log("👉 [ESB] Forwarding upload user avatar request")
                .process(jwtProcessor)
                .setHeader(Exchange.HTTP_METHOD, constant("POST"))
                .removeHeader("CamelHttpUri")
                .removeHeader("CamelHttpPath")
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
                .put("/approve/{roomId}").to("direct:approveRoom")
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

        from("direct:approveRoom")
                .routeId("approve-room-route")
                .log("👉 [ESB] Forwarding approve room request: ${header.roomId} with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://room-management-service:8080/api/room/approve/${header.roomId}?bridgeEndpoint=true&httpMethod=PUT")
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

        // chat routes
        rest("/chat")
                .get("/get-all-user-conversations").to("direct:getUserConversations")
                .get("/conversation/{conversationId}").to("direct:getConversationById")
                .post("/add-conversations/{roomId}").to("direct:createConversation")
                .get("/search-by-conversation-name").to("direct:searchConversationByConversationName")
                .post("/send-message").to("direct:sendMessage")
                .delete("/delete-conversation/{conversationId}").to("direct:deleteConversation");


        from("direct:getUserConversations")
                .routeId("get-user-conversations-route")
                .log("👉 [ESB] Forwarding get user conversations request")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .to("http://communication-service:8080/api/chat/get-all-user-conversations?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:searchConversationByConversationName")
                .routeId("search-conversation-by-name-route")
                .log("👉 [ESB] Forwarding search conversation by name request: ${header.name}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://communication-service:8080/api/chat/search-by-conversation-name?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:createConversation")
                .routeId("create-conversation-route")
                .log("👉 [ESB] Forwarding create conversation request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .toD("http://communication-service:8080/api/chat/add-conversations/${header.roomId}?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:sendMessage")
                .routeId("send-message-route")
                .log("👉 [ESB] Forwarding send message request with body: ${body}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .marshal().json(JsonLibrary.Jackson)
                .to("http://communication-service:8080/api/chat/send-message?bridgeEndpoint=true&httpMethod=POST")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:getConversationById")
                .routeId("get-conversation-by-id-route")
                .log("👉 [ESB] Forwarding get conversation by id request: ${header.conversationId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://communication-service:8080/api/chat/conversation/${header.conversationId}?bridgeEndpoint=true&httpMethod=GET")
                .unmarshal().json(JsonLibrary.Jackson);

        from("direct:deleteConversation")
                .routeId("delete-conversation-route")
                .log("👉 [ESB] Forwarding delete conversation request: ${header.conversationId}")
                .process(jwtProcessor)
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("http://communication-service:8080/api/chat/delete-conversation/${header.conversationId}?bridgeEndpoint=true&httpMethod=DELETE")
                .unmarshal().json(JsonLibrary.Jackson);

        // SerpAPI proxy routes for Google Maps
        rest("/maps")
                .get("/autocomplete").to("direct:mapsAutocomplete")
                .get("/place-details").to("direct:mapsPlaceDetails")
                .get("/reverse-geocode").to("direct:mapsReverseGeocode");

        from("direct:mapsAutocomplete")
                .routeId("maps-autocomplete-route")
                .log("👉 [ESB] Forwarding Google Maps Autocomplete request: q=${header.q}")
                .process(exchange -> {
                    try {
                        String query = exchange.getIn().getHeader("q", String.class);
                        String apiKey = exchange.getIn().getHeader("apiKey", String.class);
                        
                        if (query == null || apiKey == null) {
                            throw new IllegalArgumentException("Missing required parameters: q or apiKey");
                        }
                        
                        String encodedQuery = java.net.URLEncoder.encode(query, "UTF-8");
                        String url = "https://serpapi.com/search?engine=google_maps_autocomplete&q=" + encodedQuery + "&api_key=" + apiKey;
                        
                        exchange.getIn().setHeader("serpApiUrl", url);
                        exchange.getIn().removeHeader("q");
                        exchange.getIn().removeHeader("apiKey");
                    } catch (Exception e) {
                        throw new RuntimeException("Error building SerpAPI URL: " + e.getMessage(), e);
                    }
                })
                .log("🔗 [ESB] SerpAPI URL: ${header.serpApiUrl}")
                .removeHeaders("CamelHttp*")
                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("${header.serpApiUrl}?bridgeEndpoint=true&throwExceptionOnFailure=false")
                .choice()
                    .when(header(Exchange.HTTP_RESPONSE_CODE).isEqualTo(200))
                        .log("✅ [ESB] SerpAPI autocomplete success")
                    .otherwise()
                        .log("❌ [ESB] SerpAPI autocomplete failed: ${header.CamelHttpResponseCode}")
                .end()
                .convertBodyTo(String.class);

        from("direct:mapsPlaceDetails")
                .routeId("maps-place-details-route")
                .log("👉 [ESB] Forwarding Google Maps Place Details request: placeId=${header.placeId}")
                .process(exchange -> {
                    try {
                        String placeId = exchange.getIn().getHeader("placeId", String.class);
                        String apiKey = exchange.getIn().getHeader("apiKey", String.class);
                        
                        if (placeId == null || apiKey == null) {
                            throw new IllegalArgumentException("Missing required parameters: placeId or apiKey");
                        }
                        
                        String encodedPlaceId = java.net.URLEncoder.encode(placeId, "UTF-8");
                        String url = "https://serpapi.com/search?engine=google_maps&q=" + encodedPlaceId + "&type=place&api_key=" + apiKey;
                        
                        exchange.getIn().setHeader("serpApiUrl", url);
                        exchange.getIn().removeHeader("placeId");
                        exchange.getIn().removeHeader("apiKey");
                    } catch (Exception e) {
                        throw new RuntimeException("Error building SerpAPI URL: " + e.getMessage(), e);
                    }
                })
                .log("🔗 [ESB] SerpAPI URL: ${header.serpApiUrl}")
                .removeHeaders("CamelHttp*")
                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("${header.serpApiUrl}?bridgeEndpoint=true&throwExceptionOnFailure=false")
                .choice()
                    .when(header(Exchange.HTTP_RESPONSE_CODE).isEqualTo(200))
                        .log("✅ [ESB] SerpAPI place details success")
                    .otherwise()
                        .log("❌ [ESB] SerpAPI place details failed: ${header.CamelHttpResponseCode}")
                .end()
                .convertBodyTo(String.class);

        from("direct:mapsReverseGeocode")
                .routeId("maps-reverse-geocode-route")
                .log("👉 [ESB] Forwarding Google Maps Reverse Geocode request: coords=${header.coords}")
                .process(exchange -> {
                    try {
                        String coords = exchange.getIn().getHeader("coords", String.class);
                        String apiKey = exchange.getIn().getHeader("apiKey", String.class);
                        
                        if (coords == null || apiKey == null) {
                            throw new IllegalArgumentException("Missing required parameters: coords or apiKey");
                        }
                        
                        String encodedCoords = java.net.URLEncoder.encode(coords, "UTF-8");
                        String url = "https://serpapi.com/search?engine=google_maps&q=" + encodedCoords + "&type=search&api_key=" + apiKey;
                        
                        exchange.getIn().setHeader("serpApiUrl", url);
                        exchange.getIn().removeHeader("coords");
                        exchange.getIn().removeHeader("apiKey");
                    } catch (Exception e) {
                        throw new RuntimeException("Error building SerpAPI URL: " + e.getMessage(), e);
                    }
                })
                .log("🔗 [ESB] SerpAPI URL: ${header.serpApiUrl}")
                .removeHeaders("CamelHttp*")
                .setHeader(Exchange.HTTP_METHOD, constant("GET"))
                .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
                .toD("${header.serpApiUrl}?bridgeEndpoint=true&throwExceptionOnFailure=false")
                .choice()
                    .when(header(Exchange.HTTP_RESPONSE_CODE).isEqualTo(200))
                        .log("✅ [ESB] SerpAPI reverse geocode success")
                    .otherwise()
                        .log("❌ [ESB] SerpAPI reverse geocode failed: ${header.CamelHttpResponseCode}")
                .end()
                .convertBodyTo(String.class);

    }
}