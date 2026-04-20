package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter @NoArgsConstructor
public class Sys07RoleMenuDto {
    private Long   roleMenuId;
    private Long   roleId;
    private Long   menuId;
    private String useYn;
    private String note;
}
