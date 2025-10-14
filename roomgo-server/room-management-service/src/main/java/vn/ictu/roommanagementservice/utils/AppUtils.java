package vn.ictu.roommanagementservice.utils;

import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AppUtils {

    public static Sort.Order parseSort(String sort) {
        if (!StringUtils.hasLength(sort)) {
            return new Sort.Order(Sort.Direction.ASC, "id");
        }
        Matcher matcher = Pattern.compile("(\\w+?)(:)(asc|desc)", Pattern.CASE_INSENSITIVE).matcher(sort);
        if (matcher.find()) {
            Sort.Direction direction = matcher.group(3).equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            return new Sort.Order(direction, matcher.group(1));
        }
        return new Sort.Order(Sort.Direction.ASC, "id");
    }

    public static String buildAddress(String address, String ward, String district, String province) {
        return String.format("%s, %s, %s, %s", address, ward, district, province);
    }
}
