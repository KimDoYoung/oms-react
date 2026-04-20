package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter @NoArgsConstructor
public class Sys05UserRoleDto {
    private Long    userRoleId;
    private Long    userId;
    private Long    roleId;
    private Integer seq;
    private String  note;
    private Long    authOrgId;
    private String  authOrgName;
}
