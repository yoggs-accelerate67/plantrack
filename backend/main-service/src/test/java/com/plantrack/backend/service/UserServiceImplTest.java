package com.plantrack.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.UserRepository;
import com.plantrack.backend.service.impl.UserServiceImpl;

import jakarta.persistence.EntityManager;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private User newUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setPassword("HashedPassword@123");
        testUser.setDepartment("IT");
        testUser.setRole("EMPLOYEE");
        testUser.setStatus("ACTIVE");

        newUser = new User();
        newUser.setName("Jane Smith");
        newUser.setEmail("jane@example.com");
        newUser.setPassword("SecurePass@123");
        newUser.setDepartment("HR");
        newUser.setRole("MANAGER");
        newUser.setStatus("ACTIVE");
    }

    // ===== CREATE USER TESTS =====
    @Test
    void testCreateUser_Success() {
        when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.empty());
     
        when(passwordEncoder.encode("SecurePass@123")).thenReturn("HashedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User createdUser = userService.createUser(newUser);

        assertNotNull(createdUser);
        assertEquals("John Doe", createdUser.getName());
        assertEquals("john@example.com", createdUser.getEmail());
        assertEquals("IT", createdUser.getDepartment());

        verify(userRepository, times(1)).findByEmail(newUser.getEmail());
        verify(passwordEncoder, times(1)).encode("SecurePass@123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(auditService, times(1)).logCreate(anyString(), anyLong(), anyString());
    }

    @Test
    void testCreateUser_EmailAlreadyExists() {
        when(userRepository.findByEmail(newUser.getEmail())).thenReturn(Optional.of(testUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.createUser(newUser);
        });

        assertEquals("A user with this email already exists. Please use a different email address.", exception.getMessage());
        verify(userRepository, times(1)).findByEmail(newUser.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(auditService, never()).logCreate(anyString(), anyLong(), anyString());
    }

    @Test
    void testCreateUser_WithoutPassword() {
        User userWithoutPassword = new User();
        userWithoutPassword.setName("Test User");
        userWithoutPassword.setEmail("test@example.com");
        userWithoutPassword.setPassword(null);
        userWithoutPassword.setDepartment("Finance");
        userWithoutPassword.setRole("EMPLOYEE");

        when(userRepository.findByEmail(userWithoutPassword.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(userWithoutPassword);

        User createdUser = userService.createUser(userWithoutPassword);

        assertNotNull(createdUser);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, times(1)).save(any(User.class));
    }

    // ===== GET ALL USERS TESTS =====
    @Test
    void testGetAllUsers_Success() {
        User user2 = new User();
        user2.setUserId(2L);
        user2.setName("Jane Doe");
        user2.setEmail("jane@example.com");
        user2.setRole("MANAGER");
        user2.setStatus("ACTIVE");

        List<User> users = Arrays.asList(testUser, user2);

        when(userRepository.findAll()).thenReturn(users);

        List<User> retrievedUsers = userService.getAllUsers();

        assertNotNull(retrievedUsers);
        assertEquals(2, retrievedUsers.size());
        assertEquals("John Doe", retrievedUsers.get(0).getName());
        assertEquals("Jane Doe", retrievedUsers.get(1).getName());

        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testGetAllUsers_EmptyList() {
        when(userRepository.findAll()).thenReturn(Arrays.asList());

        List<User> retrievedUsers = userService.getAllUsers();

        assertNotNull(retrievedUsers);
        assertEquals(0, retrievedUsers.size());

        verify(userRepository, times(1)).findAll();
    }

    // ===== GET USER BY ID TESTS =====
    @Test
    void testGetUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        User retrievedUser = userService.getUserById(1L);

        assertNotNull(retrievedUser);
        assertEquals(1L, retrievedUser.getUserId());
        assertEquals("John Doe", retrievedUser.getName());
        assertEquals("john@example.com", retrievedUser.getEmail());

        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testGetUserById_NotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.getUserById(999L);
        });

        assertEquals("User not found with id: 999", exception.getMessage());
        verify(userRepository, times(1)).findById(999L);
    }

    // ===== UPDATE USER TESTS =====
    @Test
    void testUpdateUser_Success() {
        User updatedData = new User();
        updatedData.setName("John Updated");
        updatedData.setEmail("john.updated@example.com");
        updatedData.setDepartment("Finance");
        updatedData.setPassword("NewPassword@123");
        updatedData.setRole("MANAGER");
        updatedData.setStatus("ACTIVE");

        User expectedUser = new User();
        expectedUser.setUserId(1L);
        expectedUser.setName("John Updated");
        expectedUser.setEmail("john.updated@example.com");
        expectedUser.setPassword("HashedNewPassword");
        expectedUser.setDepartment("Finance");
        expectedUser.setRole("MANAGER");
        expectedUser.setStatus("ACTIVE");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("NewPassword@123")).thenReturn("HashedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(expectedUser);

        User updatedUser = userService.updateUser(1L, updatedData);

        assertNotNull(updatedUser);
        assertEquals("John Updated", updatedUser.getName());
        assertEquals("john.updated@example.com", updatedUser.getEmail());
        assertEquals("Finance", updatedUser.getDepartment());
        assertEquals("MANAGER", updatedUser.getRole());

        verify(userRepository, times(1)).findById(1L);
        verify(passwordEncoder, times(1)).encode("NewPassword@123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(auditService, times(1)).logUpdate(anyString(), anyLong(), anyString());
    }

    @Test
    void testUpdateUser_PartialUpdate() {
        User partialUpdate = new User();
        partialUpdate.setName("John Updated Only");
        // Other fields are null

        User expectedUser = new User();
        expectedUser.setUserId(1L);
        expectedUser.setName("John Updated Only");
        expectedUser.setEmail("john@example.com");
        expectedUser.setDepartment("IT");
        expectedUser.setRole("EMPLOYEE");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(expectedUser);

        User updatedUser = userService.updateUser(1L, partialUpdate);

        assertNotNull(updatedUser);
        assertEquals("John Updated Only", updatedUser.getName());
        assertEquals("john@example.com", updatedUser.getEmail()); // Unchanged
        assertEquals("IT", updatedUser.getDepartment()); // Unchanged

        verify(userRepository, times(1)).findById(1L);
        verify(passwordEncoder, never()).encode(anyString()); // No password update
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_UserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.updateUser(999L, newUser);
        });

        assertEquals("User not found with id: 999", exception.getMessage());
        verify(userRepository, times(1)).findById(999L);
        verify(userRepository, never()).save(any(User.class));
        verify(auditService, never()).logUpdate(anyString(), anyLong(), anyString());
    }

    // ===== DELETE USER TESTS =====

    @Test
    void testDeleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // FIXED: Mock BOTH overloads of createNativeQuery
        jakarta.persistence.Query mockQuery = mock(jakarta.persistence.Query.class);
        when(mockQuery.setParameter(anyString(), any())).thenReturn(mockQuery);
        when(mockQuery.executeUpdate()).thenReturn(0);
        when(mockQuery.getResultList()).thenReturn(Arrays.asList());

        // Mock both: createNativeQuery(String) and createNativeQuery(String, Class)
        when(entityManager.createNativeQuery(anyString())).thenReturn(mockQuery);
        when(entityManager.createNativeQuery(anyString(), any(Class.class))).thenReturn(mockQuery);

        userService.deleteUser(1L);

        verify(userRepository, times(1)).findById(1L);
        verify(entityManager, atLeastOnce()).createNativeQuery(anyString());
        verify(userRepository, times(1)).deleteById(1L);
        verify(auditService, times(1)).logDelete(anyString(), anyLong(), anyString());
    }


    @Test
    void testDeleteUser_UserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.deleteUser(999L);
        });

        assertEquals("User not found with id: 999", exception.getMessage());
        verify(userRepository, times(1)).findById(999L);
        verify(userRepository, never()).deleteById(anyLong());
        verify(auditService, never()).logDelete(anyString(), anyLong(), anyString());
    }

    // ===== EDGE CASE TESTS =====
    @Test
    void testCreateUser_EmptyPassword() {
        User userWithEmptyPassword = new User();
        userWithEmptyPassword.setName("Test User");
        userWithEmptyPassword.setEmail("test@example.com");
        userWithEmptyPassword.setPassword("");
        userWithEmptyPassword.setDepartment("IT");

        when(userRepository.findByEmail(userWithEmptyPassword.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(userWithEmptyPassword);

        User createdUser = userService.createUser(userWithEmptyPassword);

        assertNotNull(createdUser);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUser_UpdatePassword() {
        User updateWithPassword = new User();
        updateWithPassword.setPassword("NewSecurePass@456");

        User expectedUser = new User();
        expectedUser.setUserId(1L);
        expectedUser.setName("John Doe");
        expectedUser.setEmail("john@example.com");
        expectedUser.setPassword("HashedNewSecurePass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("NewSecurePass@456")).thenReturn("HashedNewSecurePass");
        when(userRepository.save(any(User.class))).thenReturn(expectedUser);

        User updatedUser = userService.updateUser(1L, updateWithPassword);

        assertNotNull(updatedUser);
        verify(passwordEncoder, times(1)).encode("NewSecurePass@456");
        verify(userRepository, times(1)).save(any(User.class));
    }
}