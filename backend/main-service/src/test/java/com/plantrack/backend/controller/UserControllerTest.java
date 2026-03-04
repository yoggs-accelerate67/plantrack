// filepath: main-service/src/test/java/com/plantrack/backend/controller/UserControllerTest.java
package com.plantrack.backend.controller;

import com.plantrack.backend.model.User;
import com.plantrack.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
        objectMapper = new ObjectMapper();
        
        // Initialize test user
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setName("John Doe");
        testUser.setEmail("john@example.com");
        testUser.setDepartment("IT");
        testUser.setRole("EMPLOYEE");
        testUser.setStatus("ACTIVE");
    }

    // ===== CREATE USER TESTS =====
    @Test
    void testCreateUser_Success() throws Exception {
        User newUser = new User();
        newUser.setName("Jane Doe");
        newUser.setEmail("jane@example.com");
        newUser.setPassword("SecurePass@123");
        newUser.setDepartment("HR");
        newUser.setRole("MANAGER");
        newUser.setStatus("ACTIVE");

        when(userService.createUser(any(User.class))).thenReturn(testUser);

        mockMvc.perform(post("/api/users")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));

        verify(userService, times(1)).createUser(any(User.class));
    }

    @Test
    void testCreateUser_InvalidEmail() throws Exception {
        User invalidUser = new User();
        invalidUser.setName("Test User");
        invalidUser.setEmail("invalid-email");
        invalidUser.setPassword("SecurePass@123");

        mockMvc.perform(post("/api/users")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).createUser(any(User.class));
    }


    // ===== GET ALL USERS TESTS =====
    @Test
    void testGetAllUsers_Success() throws Exception {
        User user2 = new User();
        user2.setUserId(2L);
        user2.setName("Jane Doe");
        user2.setEmail("jane@example.com");
        user2.setRole("MANAGER");
        user2.setStatus("ACTIVE");

        List<User> users = Arrays.asList(testUser, user2);

        when(userService.getAllUsers()).thenReturn(users);

        mockMvc.perform(get("/api/users")
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].userId").value(1L))
                .andExpect(jsonPath("$[1].userId").value(2L));

        verify(userService, times(1)).getAllUsers();
    }

    @Test
    void testGetAllUsers_EmptyList() throws Exception {
        when(userService.getAllUsers()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/users")
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(userService, times(1)).getAllUsers();
    }

    // ===== GET USERS FOR MENTIONS TESTS =====
    @Test
    void testGetUsersForMentions_Success() throws Exception {
        User activeUser1 = new User();
        activeUser1.setUserId(1L);
        activeUser1.setName("Active User 1");
        activeUser1.setStatus("ACTIVE");

        User inactiveUser = new User();
        inactiveUser.setUserId(2L);
        inactiveUser.setName("Inactive User");
        inactiveUser.setStatus("INACTIVE");

        List<User> allUsers = Arrays.asList(activeUser1, inactiveUser);
        when(userService.getAllUsers()).thenReturn(allUsers);

        mockMvc.perform(get("/api/users/mentions")
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Active User 1"));

        verify(userService, times(1)).getAllUsers();
    }

    @Test
    void testGetUsersForMentions_NoActiveUsers() throws Exception {
        User inactiveUser = new User();
        inactiveUser.setUserId(1L);
        inactiveUser.setName("Inactive User");
        inactiveUser.setStatus("INACTIVE");

        when(userService.getAllUsers()).thenReturn(Arrays.asList(inactiveUser));

        mockMvc.perform(get("/api/users/mentions")
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ===== GET USER BY ID TESTS =====
    @Test
    void testGetUserById_Success() throws Exception {
        when(userService.getUserById(1L)).thenReturn(testUser);

        mockMvc.perform(get("/api/users/1")
                .contentType("application/json"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));

        verify(userService, times(1)).getUserById(1L);
    }

    @Test
    void testGetUserById_NotFound() throws Exception {
        when(userService.getUserById(999L))
                .thenThrow(new RuntimeException("User not found with id: 999"));

        mockMvc.perform(get("/api/users/999")
                .contentType("application/json"))
                .andExpect(status().isBadRequest());

        verify(userService, times(1)).getUserById(999L);
    }

    // ===== UPDATE USER TESTS =====
    @Test
    void testUpdateUser_Success() throws Exception {
        User updatedUser = new User();
        updatedUser.setName("John Updated");
        updatedUser.setEmail("john.updated@example.com");
        updatedUser.setDepartment("Finance");

        User returnedUser = testUser;
        returnedUser.setName("John Updated");
        returnedUser.setEmail("john.updated@example.com");
        returnedUser.setDepartment("Finance");

        when(userService.updateUser(eq(1L), any(User.class))).thenReturn(returnedUser);

        mockMvc.perform(put("/api/users/1")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(updatedUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.name").value("John Updated"));

        verify(userService, times(1)).updateUser(eq(1L), any(User.class));
    }

    @Test
    void testUpdateUser_UserNotFound() throws Exception {
        User updateData = new User();
        updateData.setName("New Name");
        updateData.setEmail("newemail@example.com");

        when(userService.updateUser(eq(999L), any(User.class)))
                .thenThrow(new RuntimeException("User not found with id: 999"));

        mockMvc.perform(put("/api/users/999")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isBadRequest());

        verify(userService, times(1)).updateUser(eq(999L), any(User.class));
    }

    // ===== DELETE USER TESTS =====
    @Test
    void testDeleteUser_Success() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1")
                .contentType("application/json"))
                .andExpect(status().isOk());

        verify(userService, times(1)).deleteUser(1L);
    }

    @Test
    void testDeleteUser_NotFound() throws Exception {
        doThrow(new RuntimeException("User not found with id: 999"))
                .when(userService).deleteUser(999L);

        mockMvc.perform(delete("/api/users/999")
                .contentType("application/json"))
                .andExpect(status().isBadRequest());

        verify(userService, times(1)).deleteUser(999L);
    }
}