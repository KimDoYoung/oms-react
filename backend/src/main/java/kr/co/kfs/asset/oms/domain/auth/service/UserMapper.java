package kr.co.kfs.asset.oms.domain.auth.service;

import kr.co.kfs.asset.oms.domain.auth.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface UserMapper {
    Optional<User> findByUserId(String userId);
    void updatePassword(@Param("userId") String userId, @Param("password") String password);
}
