package com.plantrack.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.plantrack.backend.exception.GlobalExceptionHandler;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.service.InitiativeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class InitiativeControllerTest {

    @Mock
    private InitiativeService initiativeService;

    @InjectMocks
    private InitiativeController initiativeController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Boot-like ObjectMapper to avoid serialization surprises in standalone MockMvc
        objectMapper = Jackson2ObjectMapperBuilder.json()
                .modules(new JavaTimeModule())
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();

        MappingJackson2HttpMessageConverter jsonConverter =
                new MappingJackson2HttpMessageConverter(objectMapper);

        mockMvc = MockMvcBuilders
                .standaloneSetup(initiativeController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(jsonConverter)
                .build();
    }

    // -------------------------------------------------
    // POST /api/milestones/{milestoneId}/initiatives
    // -------------------------------------------------

    @Test
    void testCreateInitiative_Success_WithAssignedUserIds() throws Exception {
        Long milestoneId = 10L;

        Initiative request = new Initiative();
        request.setTitle("Implement Service Layer");
        request.setDescription("Implement and test service layer");
        request.setStatus("PLANNED");

        Initiative created = new Initiative();
        created.setInitiativeId(1001L);
        created.setTitle("Implement Service Layer");
        created.setDescription("Implement and test service layer");
        created.setStatus("PLANNED");

        when(initiativeService.createInitiative(eq(milestoneId), anyList(), any(Initiative.class)))
                .thenReturn(created);

        mockMvc.perform(post("/api/milestones/{milestoneId}/initiatives", milestoneId)
                        .param("assignedUserIds", "1, 2,3")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.initiativeId").value(1001L))
                .andExpect(jsonPath("$.title").value("Implement Service Layer"))
                .andExpect(jsonPath("$.status").value("PLANNED"));

        // Verify parsed userIds
        ArgumentCaptor<List<Long>> userIdsCaptor = ArgumentCaptor.forClass(List.class);
        verify(initiativeService, times(1))
                .createInitiative(eq(milestoneId), userIdsCaptor.capture(), any(Initiative.class));

        List<Long> userIds = userIdsCaptor.getValue();
        // Expect [1,2,3] in order after trimming/filtering
        org.junit.jupiter.api.Assertions.assertEquals(Arrays.asList(1L, 2L, 3L), userIds);
    }

    @Test
    void testCreateInitiative_MissingAssignedUserIds_BadRequest() throws Exception {
        Long milestoneId = 11L;

        Initiative request = new Initiative();
        request.setTitle("UI Implementation");
        request.setStatus("PLANNED");

        // Controller throws RuntimeException if assignedUserIds missing/blank
        mockMvc.perform(post("/api/milestones/{milestoneId}/initiatives", milestoneId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(initiativeService, never()).createInitiative(anyLong(), anyList(), any(Initiative.class));
    }

    @Test
    void testCreateInitiative_InvalidAssignedUserIds_NonNumeric_BadRequest() throws Exception {
        Long milestoneId = 12L;

        Initiative request = new Initiative();
        request.setTitle("API Gateway");
        request.setStatus("PLANNED");

        // "a" will cause NumberFormatException during parsing -> handled by advice -> 400
        mockMvc.perform(post("/api/milestones/{milestoneId}/initiatives", milestoneId)
                        .param("assignedUserIds", "1,a,3")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(initiativeService, never()).createInitiative(anyLong(), anyList(), any(Initiative.class));
    }

    @Test
    void testCreateInitiative_ValidationError_MissingTitle() throws Exception {
        Long milestoneId = 13L;

        String invalidBody = """
            {
              "description": "desc",
              "status": "PLANNED"
            }
            """;

        mockMvc.perform(post("/api/milestones/{milestoneId}/initiatives", milestoneId)
                        .param("assignedUserIds", "5,6")
                        .contentType("application/json")
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", notNullValue()));

        verify(initiativeService, never()).createInitiative(anyLong(), anyList(), any(Initiative.class));
    }

    @Test
    void testCreateInitiative_ServiceThrows_BadRequest() throws Exception {
        Long milestoneId = 14L;

        Initiative request = new Initiative();
        request.setTitle("Backend Integration");
        request.setStatus("PLANNED");

        when(initiativeService.createInitiative(eq(milestoneId), anyList(), any(Initiative.class)))
                .thenThrow(new RuntimeException("Milestone not found"));

        mockMvc.perform(post("/api/milestones/{milestoneId}/initiatives", milestoneId)
                        .param("assignedUserIds", "9,10")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(initiativeService, times(1)).createInitiative(eq(milestoneId), anyList(), any(Initiative.class));
    }

    // -------------------------------------------------
    // GET /api/milestones/{milestoneId}/initiatives
    // -------------------------------------------------

    @Test
    void testGetInitiatives_Success() throws Exception {
        Long milestoneId = 21L;

        Initiative i1 = new Initiative(); i1.setInitiativeId(201L); i1.setTitle("I-1"); i1.setStatus("PLANNED");
        Initiative i2 = new Initiative(); i2.setInitiativeId(202L); i2.setTitle("I-2"); i2.setStatus("IN_PROGRESS");

        when(initiativeService.getInitiativesByMilestone(milestoneId))
                .thenReturn(Arrays.asList(i1, i2));

        mockMvc.perform(get("/api/milestones/{milestoneId}/initiatives", milestoneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].initiativeId").value(201L))
                .andExpect(jsonPath("$[1].initiativeId").value(202L));

        verify(initiativeService, times(1)).getInitiativesByMilestone(milestoneId);
    }

    @Test
    void testGetInitiatives_Empty() throws Exception {
        Long milestoneId = 22L;

        when(initiativeService.getInitiativesByMilestone(milestoneId)).thenReturn(List.of());

        mockMvc.perform(get("/api/milestones/{milestoneId}/initiatives", milestoneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));

        verify(initiativeService, times(1)).getInitiativesByMilestone(milestoneId);
    }

    // -------------------------------------------------
    // PUT /api/initiatives/{initiativeId}
    // -------------------------------------------------

    @Test
    void testUpdateInitiative_Success() throws Exception {
        Long initiativeId = 301L;

        Initiative update = new Initiative();
        update.setTitle("Refined Scope");
        update.setStatus("IN_PROGRESS");

        Initiative returned = new Initiative();
        returned.setInitiativeId(initiativeId);
        returned.setTitle("Refined Scope");
        returned.setStatus("IN_PROGRESS");

        when(initiativeService.updateInitiative(eq(initiativeId), any(Initiative.class)))
                .thenReturn(returned);

        mockMvc.perform(put("/api/initiatives/{initiativeId}", initiativeId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.initiativeId").value(301L))
                .andExpect(jsonPath("$.title").value("Refined Scope"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(initiativeService, times(1)).updateInitiative(eq(initiativeId), any(Initiative.class));
    }

    @Test
    void testUpdateInitiative_ValidationError_MissingTitle() throws Exception {
        Long initiativeId = 302L;

        String invalidBody = """
            { "status": "IN_PROGRESS" }
            """;

        mockMvc.perform(put("/api/initiatives/{initiativeId}", initiativeId)
                        .contentType("application/json")
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", notNullValue()));

        verify(initiativeService, never()).updateInitiative(anyLong(), any(Initiative.class));
    }

    @Test
    void testUpdateInitiative_ServiceThrows() throws Exception {
        Long initiativeId = 303L;

        Initiative update = new Initiative();
        update.setTitle("X");

        when(initiativeService.updateInitiative(eq(initiativeId), any(Initiative.class)))
                .thenThrow(new RuntimeException("Initiative not found"));

        mockMvc.perform(put("/api/initiatives/{initiativeId}", initiativeId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());

        verify(initiativeService, times(1)).updateInitiative(eq(initiativeId), any(Initiative.class));
    }

    // -------------------------------------------------
    // GET /api/users/{userId}/initiatives
    // -------------------------------------------------

    @Test
    void testGetMyInitiatives_Success() throws Exception {
        Long userId = 401L;

        Initiative i1 = new Initiative(); i1.setInitiativeId(901L); i1.setTitle("U1"); i1.setStatus("PLANNED");
        Initiative i2 = new Initiative(); i2.setInitiativeId(902L); i2.setTitle("U2"); i2.setStatus("COMPLETED");

        when(initiativeService.getInitiativesByUser(userId))
                .thenReturn(Arrays.asList(i1, i2));

        mockMvc.perform(get("/api/users/{userId}/initiatives", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].initiativeId").value(901L))
                .andExpect(jsonPath("$[1].initiativeId").value(902L));

        verify(initiativeService, times(1)).getInitiativesByUser(userId);
    }

    @Test
    void testGetMyInitiatives_Empty() throws Exception {
        Long userId = 402L;

        when(initiativeService.getInitiativesByUser(userId)).thenReturn(List.of());

        mockMvc.perform(get("/api/users/{userId}/initiatives", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));

        verify(initiativeService, times(1)).getInitiativesByUser(userId);
    }

    // -------------------------------------------------
    // DELETE /api/initiatives/{initiativeId}
    // -------------------------------------------------

    @Test
    void testDeleteInitiative_Success_NoContent() throws Exception {
        Long initiativeId = 801L;

        doNothing().when(initiativeService).deleteInitiative(initiativeId);

        mockMvc.perform(delete("/api/initiatives/{initiativeId}", initiativeId))
                .andExpect(status().isNoContent());

        verify(initiativeService, times(1)).deleteInitiative(initiativeId);
    }

    @Test
    void testDeleteInitiative_ServiceThrows_BadRequest() throws Exception {
        Long initiativeId = 802L;

        doThrow(new RuntimeException("Cannot delete")).when(initiativeService).deleteInitiative(initiativeId);

        mockMvc.perform(delete("/api/initiatives/{initiativeId}", initiativeId))
                .andExpect(status().isBadRequest());

        verify(initiativeService, times(1)).deleteInitiative(initiativeId);
    }
}