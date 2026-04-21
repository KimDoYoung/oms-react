package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys07RoleMenuDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys07RoleMenuMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys07RoleMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys07RoleMenuServiceImpl implements Sys07RoleMenuService {

    private final Sys07RoleMenuMapper mapper;

    @Override
    public List<Sys07RoleMenuDto> getByRoleId(Long roleId) {
        return mapper.selectByRoleId(roleId);
    }

    @Override
    @Transactional
    public int insert(Sys07RoleMenuDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int update(Sys07RoleMenuDto dto) {
        return mapper.update(dto);
    }

    @Override
    @Transactional
    public int delete(Long roleMenuId) {
        return mapper.delete(roleMenuId);
    }

    @Override
    @Transactional
    public int deleteByRoleId(Long roleId) {
        return mapper.deleteByRoleId(roleId);
    }
}
