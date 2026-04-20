package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys04RoleDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys04RoleMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys04RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys04RoleServiceImpl implements Sys04RoleService {

    private final Sys04RoleMapper mapper;

    @Override
    public Sys04RoleDto getById(Long roleId) {
        return mapper.selectById(roleId);
    }

    @Override
    public List<Sys04RoleDto> getByCompanyId(Long companyId) {
        return mapper.selectByCompanyId(companyId);
    }

    @Override
    public List<Sys04RoleDto> search(Long companyId, String roleName) {
        if (roleName == null || roleName.isEmpty()) {
            roleName = "%";
        } else {
            roleName = "%" + roleName + "%";
        }
        return mapper.selectByName(companyId, roleName);
    }

    @Override
    public List<Sys04RoleDto> getByUserId(Long companyId, Long userId) {
        return mapper.selectByUserId(companyId, userId);
    }

    @Override
    @Transactional
    public int insert(Sys04RoleDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int update(Sys04RoleDto dto) {
        return mapper.update(dto);
    }

    @Override
    @Transactional
    public int delete(Long roleId) {
        return mapper.delete(roleId);
    }
}
