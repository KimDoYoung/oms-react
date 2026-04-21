package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys05UserRoleDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys05UserRoleMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys05UserRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys05UserRoleServiceImpl implements Sys05UserRoleService {

    private final Sys05UserRoleMapper mapper;

    @Override
    public List<Sys05UserRoleDto> getByUserId(Long userId) {
        return mapper.selectByUserId(userId);
    }

    @Override
    public List<Sys05UserRoleDto> getByRoleId(Long roleId) {
        return mapper.selectByRoleId(roleId);
    }

    @Override
    @Transactional
    public int insert(Sys05UserRoleDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int delete(Long userRoleId) {
        return mapper.delete(userRoleId);
    }
}
