package vn.ictu.usermanagementservice.utils;

public class NameUtils {

    public static String[] splitFullName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return new String[]{"", ""};
        }

        String trimmed = fullName.trim();
        String[] parts = trimmed.split(" ", 2);

        if (parts.length == 2) {
            return new String[]{parts[0], parts[1]};
        } else {
            return new String[]{trimmed, ""};
        }
    }
}
