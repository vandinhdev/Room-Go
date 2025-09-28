package vn.ictu.roommanagementservice.common.response;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public abstract class PageResponseAbstract implements Serializable {
    private int pageNumber;
    private int pageSize;
    private long totalPages;
    private long totalElements;
}
