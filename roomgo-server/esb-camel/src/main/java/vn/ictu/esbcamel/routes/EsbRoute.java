package vn.ictu.esbcamel.routes;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.Map;

@Component
public class EsbRoute extends RouteBuilder {

    // Inject mapping từ ConfigMap (mapping.yml)
    @Value("classpath:/mapping.yml")
    private org.springframework.core.io.Resource mappingFile;

    private Map<String, String> serviceMap;

    @Override
    public void configure() throws Exception {
        // Load file mapping.yml từ ConfigMap mount vào pod
        try (InputStream in = mappingFile.getInputStream()) {
            Yaml yaml = new Yaml();
            Map<String, Object> obj = yaml.load(in);
            serviceMap = (Map<String, String>) obj.get("routes");
        }

        from("jetty:http://0.0.0.0:8080/api/*")
                .routeId("dynamic-esb-route")
                .process(exchange -> {
                    String path = exchange.getIn().getHeader("CamelHttpPath", String.class);

                    // Lấy prefix (vd: user, room, communication)
                    String prefix = path.split("/")[0];
                    String targetService = serviceMap.get(prefix);

                    if (targetService == null) {
                        throw new RuntimeException("Không tìm thấy service cho prefix: " + prefix);
                    }

                    String uri = "http://" + targetService + ":8080/api/" + path;
                    exchange.getIn().setHeader("targetUri", uri);
                })
                .toD("${header.targetUri}");
    }
}
