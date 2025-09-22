package vandinh.ictu.search_service.common.response;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class SearchQueryBuilder {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String buildQuery(Map<String, Object> params) {
        try {
            // convert map thành JSON string để lưu
            return mapper.writeValueAsString(params);
        } catch (JsonProcessingException e) {
            // fallback nếu lỗi JSON
            return params.toString();
        }
    }
}

