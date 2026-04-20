package kr.co.kfs.asset.oms.domain.sys.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class Sys06MenuDto {
    private Long    menuId;
    private Long    parentId;
    private String  menuName;
    private String  className;
    private Integer seq;
    private String  useYn;
    private String  note;
    private String  menuNo;
    private String  menuNameWithNo;
    private String  roleMenuYn;
    private String  parentMenuName;
    private String  menuFullName;
    private Integer level;
    private String  mobiUseYn;
    private List<Sys06MenuDto> children;
}
