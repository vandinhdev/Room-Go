package vandinh.ictu.search_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vandinh.ictu.search_service.common.response.ApiResponse;
import vandinh.ictu.search_service.dto.request.SearchRequest;
import vandinh.ictu.search_service.dto.response.RoomPageResponse;
import vandinh.ictu.search_service.models.SearchHistory;
import vandinh.ictu.search_service.service.SearchHistoryService;
import vandinh.ictu.search_service.service.SearchService;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final SearchHistoryService searchHistoryService;
    private final SearchService searchService;
    // Get search history by user email
    @Operation(summary = "Get search history by user email", description = "API retrieve search history by user email from database")
    @RequestMapping("/history")
    public ApiResponse getSearchHistoryByUserEmail(@RequestHeader("X-User-Email")  String email,
                                                   @RequestHeader("Authorization") String authorizationHeader) {
        return ApiResponse.builder()
                .status(200)
                .message("search history")
                .data(searchHistoryService.getSearchHistoryByUserEmail(email, authorizationHeader))
                .build();

    }


    @Operation(summary = "Search rooms", description = "Tìm kiếm phòng theo từ khóa, địa chỉ, giá, diện tích")
    @GetMapping("/rooms")
    public ApiResponse searchRooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String ward,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minArea,
            @RequestParam(required = false) BigDecimal maxArea,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("X-User-Email")  String email,
            @RequestHeader("Authorization") String bearerToken
    ){
        return ApiResponse.builder()
                .status(200)
                .message("search rooms success")
                .data(searchService.searchRooms(keyword, province, district, ward,
                        minPrice != null ? minPrice.doubleValue() : null,
                        maxPrice != null ? maxPrice.doubleValue() : null,
                        minArea != null ? minArea.doubleValue() : null,
                        maxArea != null ? maxArea.doubleValue() : null,
                        sort, page, size, email,  bearerToken))
                .build();
    }

}
