package vn.ictu.esbcamel.routes;


import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
public class EsbRouteConfig extends RouteBuilder {

    @Value("${routes.user}")
    private String userService;

    @Value("${routes.room}")
    private String roomService;

    @Value("${routes.communication}")
    private String communicationService;

    @Override
    public void configure() throws Exception {
        from("servlet:/ping")
                .log("➡️ Nhận được request /ping")
                .setBody(constant("pong from ESB"));


        from("servlet:/user/auth/*?matchOnUriPrefix=true")
                .routeId("user-auth-route")
                .log("➡️ ESB: ${header.CamelHttpMethod} ${header.CamelHttpPath}, body=${body}")
                .toD(userService + "/api/user/auth${header.CamelHttpPath}?bridgeEndpoint=true")
                .log("✅ Forwarded to " + userService + "/api/user/auth${header.CamelHttpPath}");

        from("servlet:/rooms/*?matchOnUriPrefix=true")
                .routeId("room-route")
                .log("➡️ ESB: ${header.CamelHttpMethod} ${header.CamelHttpPath}, body=${body}")
                .toD(roomService + "/api/rooms${header.CamelHttpPath}?bridgeEndpoint=true")
                .log("✅ Forwarded to " + roomService + "/api/rooms${header.CamelHttpPath}");

        from("servlet:/communication/*?matchOnUriPrefix=true")
                .routeId("communication-route")
                .log("➡️ ESB: ${header.CamelHttpMethod} ${header.CamelHttpPath}, body=${body}")
                .toD(communicationService + "/api/communication${header.CamelHttpPath}?bridgeEndpoint=true")
                .log("✅ Forwarded to " + communicationService + "/api/communication${header.CamelHttpPath}");
    }
}


