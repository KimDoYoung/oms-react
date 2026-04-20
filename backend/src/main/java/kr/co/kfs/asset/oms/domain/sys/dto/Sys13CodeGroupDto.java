package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter @Setter @NoArgsConstructor
public class Sys13CodeGroupDto {
    private Long   codeGroupId;
    private String kindGroupCode;
    private String kindGroupName;
    private Long   codeKindId;
    private Long   codeId;
    private String note;
    private String code;
    private String name;
}
