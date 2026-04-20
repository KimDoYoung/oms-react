package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys08CodeKindDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys08CodeKindMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys08CodeKindService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys08CodeKindServiceImpl implements Sys08CodeKindService {

    private final Sys08CodeKindMapper mapper;

    @Override
    public List<Sys08CodeKindDto> getAll() {
        return mapper.selectByAll();
    }

    @Override
    public List<Sys08CodeKindDto> search(String kindName, String sysYn) {
        if (kindName == null || kindName.isEmpty()) {
            kindName = "%";
        } else {
            kindName = "%" + kindName + "%";
        }

        if (sysYn == null || sysYn.isEmpty()) {
            sysYn = "false";
        }
        return mapper.selectByKindName(kindName, sysYn);
    }

    @Override
    public Sys08CodeKindDto getByKindCode(String kindCode) {
        return mapper.selectByKindCode(kindCode);
    }

    @Override
    public Sys08CodeKindDto getById(Long codeKindId) {
        return mapper.selectById(codeKindId);
    }

    @Override
    @Transactional
    public int insert(Sys08CodeKindDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int update(Sys08CodeKindDto dto) {
        return mapper.update(dto);
    }

    @Override
    @Transactional
    public int delete(Long codeKindId) {
        return mapper.delete(codeKindId);
    }
}
