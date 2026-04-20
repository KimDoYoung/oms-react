package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys09CodeDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys09CodeMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys09CodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys09CodeServiceImpl implements Sys09CodeService {

    private final Sys09CodeMapper mapper;

    @Override
    public Sys09CodeDto getById(Long codeId) {
        return mapper.selectById(codeId);
    }

    @Override
    public List<Sys09CodeDto> getByCodeKindId(Long codeKindId, Long companyId, String searchText) {
        if (searchText == null || searchText.isEmpty()) {
            searchText = "%";
        } else {
            searchText = "%" + searchText + "%";
        }
        return mapper.selectByCodeKindId(codeKindId, companyId, searchText);
    }

    @Override
    public List<Sys09CodeDto> getByKindCode(String kindCode, Long companyId) {
        if (companyId == null) {
            companyId = 0L;
        }
        return mapper.selectByStringComboBox(kindCode, companyId);
    }

    @Override
    @Transactional
    public int insert(Sys09CodeDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int update(Sys09CodeDto dto) {
        return mapper.update(dto);
    }

    @Override
    @Transactional
    public int delete(Long codeKindId, Long companyId) {
        return mapper.delete(codeKindId, companyId);
    }
}
