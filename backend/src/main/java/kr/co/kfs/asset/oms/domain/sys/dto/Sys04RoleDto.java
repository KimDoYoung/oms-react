package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter @NoArgsConstructor
public class Sys04RoleDto {
    private Long    roleId;
    private Long    companyId;
    private String  roleName;
    private Integer seq;
    private String  defaultRole;
    private String  userRoleYn;
    private String  note;
    private String  adminYn;
    private String  companyName;
}
