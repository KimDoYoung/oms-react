package kr.co.kfs.asset.oms.common.config;

import kr.co.kfs.asset.oms.common.security.JwtAccessDeniedHandler;
import kr.co.kfs.asset.oms.common.security.JwtAuthenticationEntryPoint;
import kr.co.kfs.asset.oms.common.security.JwtFilter;
import kr.co.kfs.asset.oms.common.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Value("${oms.cors.allowed-origins:http://localhost:5174}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    new AntPathRequestMatcher("/auth/**"),
                    new AntPathRequestMatcher("/swagger-ui/**"),
                    new AntPathRequestMatcher("/swagger-ui.html"),
                    new AntPathRequestMatcher("/v3/api-docs/**"),
                    new AntPathRequestMatcher("/health"),
                    new AntPathRequestMatcher("/error"),
                    // React SPA 정적 파일 및 라우트
                    new AntPathRequestMatcher("/"),
                    new AntPathRequestMatcher("/index.html"),
                    new AntPathRequestMatcher("/*.js"),
                    new AntPathRequestMatcher("/*.css"),
                    new AntPathRequestMatcher("/*.ico"),
                    new AntPathRequestMatcher("/*.png"),
                    new AntPathRequestMatcher("/*.svg"),
                    new AntPathRequestMatcher("/assets/**"),
                    new AntPathRequestMatcher("/login")
                ).permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .addFilterBefore(new JwtFilter(jwtUtil, redisTemplate), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 기본 허용 오리진 리스트 생성
        List<String> origins = new java.util.ArrayList<>(List.of(allowedOrigins.split(",")));
        // 서브도메인 지원을 위한 패턴 추가
        origins.add("http://*.localhost:5174");
        
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
