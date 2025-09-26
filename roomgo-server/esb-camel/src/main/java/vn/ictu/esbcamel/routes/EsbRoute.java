package vn.ictu.esbcamel.routes;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class EsbRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {

        // ✅ Route đến Communication Service
        from("jetty:http://0.0.0.0:8080/communication")
                .routeId("communication-route")
                .to("http://communication-service:8080/api/communication");

        // ✅ Route đến User Management Service (JSON -> XML transform)
        from("jetty:http://0.0.0.0:8080/user")
                .routeId("user-route")
                .unmarshal().json()
                .marshal().jacksonXml()
                .to("http://user-service:8080/api/user");

        // ✅ Route đến Collaboration Service (logging)
        from("jetty:http://0.0.0.0:8080/collab")
                .routeId("collab-route")
                .log("📨 Request Collaboration Service: ${body}")
                .to("http://collaboration-service:8080/api/collab");
    }
}

