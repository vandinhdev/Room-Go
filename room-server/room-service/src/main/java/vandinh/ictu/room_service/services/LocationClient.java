package vandinh.ictu.room_service.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocationClient {
    private final RestTemplate restTemplate;

    private static final String BASE_URL = "https://provinces.open-api.vn/api/v2";

    public List<Map<String, Object>> getProvinces() {
        String url = BASE_URL; // v2 trả về luôn danh sách provinces
        return restTemplate.getForObject(url, List.class);
    }

    public Map<String, Object> getDistrictsByProvince(int provinceCode) {
        String url = BASE_URL + "/p/" + provinceCode + "?depth=2";
        return restTemplate.getForObject(url, Map.class);
    }

    public Map<String, Object> getWardsByDistrict(int districtCode) {
        String url = BASE_URL + "/d/" + districtCode + "?depth=2";
        return restTemplate.getForObject(url, Map.class);
    }
}


