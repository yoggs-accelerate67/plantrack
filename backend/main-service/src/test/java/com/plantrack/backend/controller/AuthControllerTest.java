package com.plantrack.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.plantrack.backend.exception.GlobalExceptionHandler;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.UserRepository;
import com.plantrack.backend.service.CustomUserDetailsService;
import com.plantrack.backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private CustomUserDetailsService userDetailsService;
    @Mock private UserRepository userRepository;
    @Mock private JwtUtil jwtUtil;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = Jackson2ObjectMapperBuilder.json()
                .modules(new JavaTimeModule())
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();

        MappingJackson2HttpMessageConverter jsonConverter =
                new MappingJackson2HttpMessageConverter(objectMapper);

        mockMvc = MockMvcBuilders
                .standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(jsonConverter)
                .build();
    }

    // -----------------------------
    // POST /api/auth/register
    // -----------------------------

    @Test
    void testRegister_Success() throws Exception {
        // Build request body as a Map so password is included in JSON
        Map<String, Object> req = new HashMap<>();
        req.put("name", "Alice");
        req.put("email", "alice@example.com");
        req.put("password", "Abcdef1@");  // valid per regex
        req.put("department", "IT");
        req.put("role", "EMPLOYEE");
        req.put("status", "ACTIVE");

        User saved = new User();
        saved.setUserId(1L);
        saved.setName("Alice");
        saved.setEmail("alice@example.com");
        saved.setDepartment("IT");
        saved.setRole("EMPLOYEE");
        saved.setStatus("ACTIVE");
        saved.setPassword("ENCODED");

        // allow null or string (defensive) — any() matches null
        when(passwordEncoder.encode(any())).thenReturn("ENCODED");
        when(userRepository.save(any(User.class))).thenReturn(saved);

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$.email").value("alice@example.com"));

        verify(passwordEncoder, times(1)).encode(any());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegister_RepositoryThrows_BadRequest() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("name", "Bob");
        req.put("email", "bob@example.com");
        req.put("password", "Abcdef1@");  // valid per regex

        when(passwordEncoder.encode(any())).thenReturn("HASHED");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Duplicate email"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(passwordEncoder, times(1)).encode(any());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegister_ValidationError_BadPasswordPattern() throws Exception {
        // Intentionally invalid password — fails your regex (@Pattern)
        Map<String, Object> req = new HashMap<>();
        req.put("name", "Jo");                   // valid name (>=2)
        req.put("email", "jo@example.com");      // valid email
        req.put("password", "password");         // invalid: no upper, no digit, no special

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(any());
    }

    // -----------------------------
    // POST /api/auth/login
    // -----------------------------

    @Test
    void testLogin_Success() throws Exception {
        String email = "carol@example.com";
        String rawPassword = "Secret@123";
        Long userId = 42L;
        String role = "ROLE_MANAGER";
        String token = "jwt-token-123";

        Map<String, String> loginBody = new HashMap<>();
        loginBody.put("email", email);
        loginBody.put("password", rawPassword);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(email, rawPassword, AuthorityUtils.createAuthorityList(role)));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                email, "N/A", AuthorityUtils.createAuthorityList(role));
        when(userDetailsService.loadUserByUsername(eq(email))).thenReturn(userDetails);

        User dbUser = new User();
        dbUser.setUserId(userId);
        dbUser.setEmail(email);
        when(userRepository.findByEmail(eq(email))).thenReturn(Optional.of(dbUser));

        when(jwtUtil.generateToken(eq(email), eq(role), eq(userId))).thenReturn(token);

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is(token)))
                .andExpect(jsonPath("$.role", is(role)))
                .andExpect(jsonPath("$.userId", is(String.valueOf(userId))));

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userDetailsService, times(1)).loadUserByUsername(eq(email));
        verify(userRepository, times(1)).findByEmail(eq(email));
        verify(jwtUtil, times(1)).generateToken(eq(email), eq(role), eq(userId));
    }

    @Test
    void testLogin_MissingEmailOrPassword_BadRequest() throws Exception {
        Map<String, String> loginBody = new HashMap<>();
        loginBody.put("email", ""); // empty triggers "Email and password are required"

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(authenticationManager, userDetailsService, userRepository, jwtUtil);
    }

    @Test
    void testLogin_BadCredentials_BadRequest() throws Exception {
        String email = "dave@example.com";
        String pwd = "Wrong";

        Map<String, String> loginBody = new HashMap<>();
        loginBody.put("email", email);
        loginBody.put("password", pwd);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isBadRequest());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verifyNoInteractions(userDetailsService, userRepository, jwtUtil);
    }

    @Test
    void testLogin_UserNotFound_BadRequest() throws Exception {
        String email = "eve@example.com";
        String pwd = "Secret@123";
        String role = "ROLE_USER";

        Map<String, String> loginBody = new HashMap<>();
        loginBody.put("email", email);
        loginBody.put("password", pwd);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(email, pwd, AuthorityUtils.createAuthorityList(role)));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                email, "N/A", AuthorityUtils.createAuthorityList(role));
        when(userDetailsService.loadUserByUsername(eq(email))).thenReturn(userDetails);

        when(userRepository.findByEmail(eq(email))).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isBadRequest());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userDetailsService, times(1)).loadUserByUsername(eq(email));
        verify(userRepository, times(1)).findByEmail(eq(email));
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void testLogin_AuthManagerGenericError_BadRequest() throws Exception {
        String email = "frank@example.com";
        String pwd = "X";

        Map<String, String> loginBody = new HashMap<>();
        loginBody.put("email", email);
        loginBody.put("password", pwd);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new IllegalStateException("auth provider down"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isBadRequest());

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verifyNoInteractions(userDetailsService, userRepository, jwtUtil);
    }
}