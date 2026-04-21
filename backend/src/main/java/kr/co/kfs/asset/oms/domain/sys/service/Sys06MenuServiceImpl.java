package kr.co.kfs.asset.oms.domain.sys.service;

import kr.co.kfs.asset.oms.domain.sys.dto.Sys06MenuDto;
import kr.co.kfs.asset.oms.domain.sys.mapper.Sys06MenuMapper;
import kr.co.kfs.asset.oms.domain.sys.service.interfaces.Sys06MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
        if (allMenus == null || allMenus.isEmpty()) return new ArrayList<>();
        
        Map<Long, Sys06MenuDto> menuMap = new HashMap<>();
        for (Sys06MenuDto menu : allMenus) {
            menu.setChildren(new ArrayList<>());
            menuMap.put(menu.getMenuId(), menu);
        }
        
        List<Sys06MenuDto> rootMenus = new ArrayList<>();
        
        // 1. 트리 구조 구성
        for (Sys06MenuDto menu : allMenus) {
            Long parentId = menu.getParentId();
            if (parentId == null || parentId == 0 || !menuMap.containsKey(parentId)) {
                rootMenus.add(menu);
                menu.setLevel(1);
            } else {
                Sys06MenuDto parent = menuMap.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(menu);
                }
            }
        }
        
        // 2. BFS 스타일로 레벨 설정 (재귀 없이 수행하여 무한루프 및 스택오버플로우 방지)
        java.util.Queue<Sys06MenuDto> queue = new java.util.LinkedList<>(rootMenus);
        Set<Long> visited = new java.util.HashSet<>();
        
        while (!queue.isEmpty()) {
            Sys06MenuDto current = queue.poll();
            if (current == null || visited.contains(current.getMenuId())) continue;
            
            visited.add(current.getMenuId());
            int nextLevel = (current.getLevel() != null ? current.getLevel() : 1) + 1;
            
            if (current.getChildren() != null) {
                for (Sys06MenuDto child : current.getChildren()) {
                    child.setLevel(nextLevel);
                    queue.offer(child);
                }
            }
        }
        
        return rootMenus;
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
