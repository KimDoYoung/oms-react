package kr.co.kfs.asset.oms.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequestDto {
    @NotBlank(message = "회사코드를 입력해 주세요.")
    private String companyCode;

    @NotBlank(message = "아이디를 입력해 주세요.")
    private String userId;

    @NotBlank(message = "비밀번호를 입력해 주세요.")
    private String userPw;
}
