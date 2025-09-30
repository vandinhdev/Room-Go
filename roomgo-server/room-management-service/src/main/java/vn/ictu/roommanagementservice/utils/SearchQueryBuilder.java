package vn.ictu.roommanagementservice.utils;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

public class SearchQueryBuilder {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static String buildQuery(Map<String, Object> params) {
        try {
            return mapper.writeValueAsString(params);
        } catch (JsonProcessingException e) {
            return params.toString();
        }
    }
}

