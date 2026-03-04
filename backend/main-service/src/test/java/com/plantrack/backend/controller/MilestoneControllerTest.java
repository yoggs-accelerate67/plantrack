package com.plantrack.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.plantrack.backend.exception.GlobalExceptionHandler;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.service.MilestoneService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MilestoneControllerTest {

    @Mock
    private MilestoneService milestoneService;

    @InjectMocks
    private MilestoneController milestoneController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Boot-like ObjectMapper so LocalDateTime serializes in standalone tests
        objectMapper = Jackson2ObjectMapperBuilder.json()
                .modules(new JavaTimeModule())
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();

        MappingJackson2HttpMessageConverter jsonConverter =
                new MappingJackson2HttpMessageConverter(objectMapper);

        mockMvc = MockMvcBuilders
                .standaloneSetup(milestoneController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(jsonConverter)
                .build();
    }

    // -----------------------------------------
    // POST /api/plans/{planId}/milestones
    // -----------------------------------------

    @Test
    void testCreateMilestone_Success() throws Exception {
        Long planId = 10L;

        Milestone request = new Milestone();
        request.setTitle("Kickoff");
        request.setDueDate(LocalDateTime.of(2026, 3, 31, 10, 0, 0));
        request.setCompletionPercent(0.0);
        request.setStatus("PLANNED");

        Milestone created = new Milestone();
        created.setMilestoneId(101L);
        created.setTitle("Kickoff");
        created.setDueDate(LocalDateTime.of(2026, 3, 31, 10, 0, 0));
        created.setCompletionPercent(0.0);
        created.setStatus("PLANNED");

        when(milestoneService.createMilestone(eq(planId), any(Milestone.class)))
                .thenReturn(created);

        mockMvc.perform(post("/api/plans/{planId}/milestones", planId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.milestoneId").value(101L))
                .andExpect(jsonPath("$.title").value("Kickoff"))
                .andExpect(jsonPath("$.status").value("PLANNED"));

        verify(milestoneService, times(1)).createMilestone(eq(planId), any(Milestone.class));
    }

    @Test
    void testCreateMilestone_ValidationError_MissingTitle() throws Exception {
        Long planId = 10L;

        // Missing title -> @NotBlank triggers MethodArgumentNotValidException -> 400 with field map
        String invalidBody = """
            {
              "dueDate": "2026-03-31T10:00:00",
              "completionPercent": 0.0,
              "status": "PLANNED"
            }
            """;

        mockMvc.perform(post("/api/plans/{planId}/milestones", planId)
                        .contentType("application/json")
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title", notNullValue()));

        verify(milestoneService, never()).createMilestone(anyLong(), any(Milestone.class));
    }

    @Test
    void testCreateMilestone_ServiceThrows() throws Exception {
        Long planId = 11L;

        Milestone request = new Milestone();
        request.setTitle("Design Complete");

        when(milestoneService.createMilestone(eq(planId), any(Milestone.class)))
                .thenThrow(new RuntimeException("Plan not found"));

        mockMvc.perform(post("/api/plans/{planId}/milestones", planId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(milestoneService, times(1)).createMilestone(eq(planId), any(Milestone.class));
    }

    // -----------------------------------------
    // GET /api/plans/{planId}/milestones
    // -----------------------------------------

    @Test
    void testGetMilestonesByPlan_Success() throws Exception {
        Long planId = 12L;

        Milestone m1 = new Milestone();
        m1.setMilestoneId(201L);
        m1.setTitle("Phase 1");

        Milestone m2 = new Milestone();
        m2.setMilestoneId(202L);
        m2.setTitle("Phase 2");

        when(milestoneService.getMilestonesByPlan(planId))
                .thenReturn(Arrays.asList(m1, m2));

        mockMvc.perform(get("/api/plans/{planId}/milestones", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].milestoneId").value(201L))
                .andExpect(jsonPath("$[1].milestoneId").value(202L));

        verify(milestoneService, times(1)).getMilestonesByPlan(planId);
    }

    @Test
    void testGetMilestonesByPlan_Empty() throws Exception {
        Long planId = 13L;

        when(milestoneService.getMilestonesByPlan(planId)).thenReturn(List.of());

        mockMvc.perform(get("/api/plans/{planId}/milestones", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));

        verify(milestoneService, times(1)).getMilestonesByPlan(planId);
    }

    // -----------------------------------------
    // PUT /api/milestones/{milestoneId}
    // -----------------------------------------

    @Test
    void testUpdateMilestone_Success() throws Exception {
        Long milestoneId = 301L;

        Milestone update = new Milestone();
        update.setTitle("Updated Title");
        update.setCompletionPercent(55.0);
        update.setStatus("IN_PROGRESS");

        Milestone returned = new Milestone();
        returned.setMilestoneId(milestoneId);
        returned.setTitle("Updated Title");
        returned.setCompletionPercent(55.0);
        returned.setStatus("IN_PROGRESS");

        when(milestoneService.updateMilestone(eq(milestoneId), any(Milestone.class)))
                .thenReturn(returned);

        mockMvc.perform(put("/api/milestones/{milestoneId}", milestoneId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.milestoneId").value(301L))
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.completionPercent").value(55.0));

        verify(milestoneService, times(1)).updateMilestone(eq(milestoneId), any(Milestone.class));
    }

    @Test
    void testUpdateMilestone_ServiceThrows() throws Exception {
        Long milestoneId = 302L;

        Milestone update = new Milestone();
        update.setTitle("X");

        when(milestoneService.updateMilestone(eq(milestoneId), any(Milestone.class)))
                .thenThrow(new RuntimeException("Milestone not found"));

        mockMvc.perform(put("/api/milestones/{milestoneId}", milestoneId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());

        verify(milestoneService, times(1)).updateMilestone(eq(milestoneId), any(Milestone.class));
    }

    // -----------------------------------------
    // DELETE /api/milestones/{milestoneId}
    // -----------------------------------------

    @Test
    void testDeleteMilestone_Success() throws Exception {
        Long milestoneId = 401L;

        doNothing().when(milestoneService).deleteMilestone(milestoneId);

        mockMvc.perform(delete("/api/milestones/{milestoneId}", milestoneId))
                .andExpect(status().isOk());

        verify(milestoneService, times(1)).deleteMilestone(milestoneId);
    }

    @Test
    void testDeleteMilestone_FailureWrappedAsRuntime() throws Exception {
        Long milestoneId = 402L;

        doThrow(new IllegalStateException("DB constraint")).when(milestoneService).deleteMilestone(milestoneId);

        // Controller wraps exception -> throws RuntimeException -> Global handler maps to 400
        mockMvc.perform(delete("/api/milestones/{milestoneId}", milestoneId))
                .andExpect(status().isBadRequest());

        verify(milestoneService, times(1)).deleteMilestone(milestoneId);
    }

    // -----------------------------------------
    // GET /api/milestones/{milestoneId}/cancel-preview
    // -----------------------------------------

    @Test
    void testGetCancelPreview_Success() throws Exception {
        Long milestoneId = 501L;

        Map<String, Object> preview = new HashMap<>();
        preview.put("milestoneId", milestoneId);
        preview.put("affectedInitiatives", 4);

        when(milestoneService.getCancelCascadePreview(milestoneId)).thenReturn(preview);

        mockMvc.perform(get("/api/milestones/{milestoneId}/cancel-preview", milestoneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.milestoneId").value(501))
                .andExpect(jsonPath("$.affectedInitiatives").value(4));

        verify(milestoneService, times(1)).getCancelCascadePreview(milestoneId);
    }

    // -----------------------------------------
    // POST /api/milestones/{milestoneId}/cancel
    // -----------------------------------------

    @Test
    void testCancelMilestoneWithCascade_Success() throws Exception {
        Long milestoneId = 601L;

        Map<String, Object> result = Map.of(
                "milestoneId", milestoneId,
                "status", "CANCELLED",
                "cancelledInitiatives", 3
        );

        when(milestoneService.cancelMilestoneWithCascade(milestoneId)).thenReturn(result);

        mockMvc.perform(post("/api/milestones/{milestoneId}/cancel", milestoneId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.milestoneId").value(601))
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelledInitiatives").value(3));

        verify(milestoneService, times(1)).cancelMilestoneWithCascade(milestoneId);
    }

    @Test
    void testCancelMilestoneWithCascade_ServiceThrows() throws Exception {
        Long milestoneId = 602L;

        when(milestoneService.cancelMilestoneWithCascade(milestoneId))
                .thenThrow(new RuntimeException("Already cancelled"));

        mockMvc.perform(post("/api/milestones/{milestoneId}/cancel", milestoneId))
                .andExpect(status().isBadRequest());

        verify(milestoneService, times(1)).cancelMilestoneWithCascade(milestoneId);
    }
}