package vandinh.ictu.room_service.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vandinh.ictu.room_service.services.LocationClient;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {
    private final LocationClient locationClient;

    @GetMapping("/provinces")
    public List<Map<String, Object>> getProvinces() {
        return locationClient.getProvinces();
    }

    @GetMapping("/districts/{provinceCode}")
    public Map<String, Object> getDistricts(@PathVariable int provinceCode) {
        return locationClient.getDistrictsByProvince(provinceCode);
    }

    @GetMapping("/wards/{districtCode}")
    public Map<String, Object> getWards(@PathVariable int districtCode) {
        return locationClient.getWardsByDistrict(districtCode);
    }
}

