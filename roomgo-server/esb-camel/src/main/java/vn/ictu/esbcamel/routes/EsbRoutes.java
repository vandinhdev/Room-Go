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
                .component("platform-http")   // ✅ đổi từ servlet sang platform-http
                .contextPath("/api/esb")
                .bindingMode(RestBindingMode.json);

        rest("/auth")
                .post("/login").to("direct:login")
                .post("/register").to("direct:register")
                .post("/refresh-token").to("direct:refresh");

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
    }


}
