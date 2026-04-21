package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys06MenuDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys06MenuMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys06MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class Sys06MenuServiceImpl implements Sys06MenuService {

    private final Sys06MenuMapper mapper;

    @Override
    public List<Sys06MenuDto> getAll() {
        return mapper.selectByAll();
    }

    @Override
    public List<Sys06MenuDto> getByUserId(Long companyId, Long userId) {
        return mapper.selectByUserId(companyId, userId);
    }

    @Override
    public List<Sys06MenuDto> getMenuTree(Long companyId, Long userId) {
        List<Sys06MenuDto> allMenus = mapper.selectByUserId(companyId, userId);
        
        Map<Long, Sys06MenuDto> menuMap = new HashMap<>();
        for (Sys06MenuDto menu : allMenus) {
            menu.setChildren(new ArrayList<>());
            menuMap.put(menu.getMenuId(), menu);
        }
        
        List<Sys06MenuDto> rootMenus = new ArrayList<>();
        
        // 1. 트리 구조 구성
        for (Sys06MenuDto menu : allMenus) {
            Long parentId = menu.getParentId();
            if (parentId == null || parentId == 0) {
                rootMenus.add(menu);
            } else {
                Sys06MenuDto parent = menuMap.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(menu);
                } else {
                    rootMenus.add(menu);
                }
            }
        }
        
        // 2. 재귀적으로 레벨 설정
        for (Sys06MenuDto root : rootMenus) {
            calculateLevel(root, 1);
        }
        
        return rootMenus;
    }

    private void calculateLevel(Sys06MenuDto menu, int level) {
        menu.setLevel(level);
        if (menu.getChildren() != null) {
            for (Sys06MenuDto child : menu.getChildren()) {
                calculateLevel(child, level + 1);
            }
        }
    }

    @Override
    @Transactional
    public int insert(Sys06MenuDto dto) {
        return mapper.insert(dto);
    }

    @Override
    @Transactional
    public int update(Sys06MenuDto dto) {
        return mapper.update(dto);
    }

    @Override
    @Transactional
    public int delete(Long menuId) {
        return mapper.delete(menuId);
    }
}
