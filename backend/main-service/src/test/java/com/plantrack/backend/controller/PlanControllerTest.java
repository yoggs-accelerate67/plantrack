package com.plantrack.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plantrack.backend.exception.GlobalExceptionHandler;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.PlanPriority;
import com.plantrack.backend.model.PlanStatus;
import com.plantrack.backend.service.PlanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PlanControllerTest {

    @Mock
    private PlanService planService;

    @InjectMocks
    private PlanController planController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(planController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
       // mockMvc=MockMvcBuilders.standaloneSetup(planController).build();
        objectMapper = new ObjectMapper();
    }

    // ---------------------------
    // POST /api/users/{userId}/plans
    // ---------------------------

    @Test
    void testCreatePlan_Success() throws Exception {
        Long userId = 1L;

        Plan request = new Plan();
        request.setTitle("Q1 Plan");
        request.setDescription("Deliver critical milestones");
        request.setPriority(PlanPriority.HIGH);
        request.setStatus(PlanStatus.IN_PROGRESS);

        Plan created = new Plan();
        created.setPlanId(100L);
        created.setTitle("Q1 Plan");
        created.setDescription("Deliver critical milestones");
        created.setPriority(PlanPriority.HIGH);
        created.setStatus(PlanStatus.IN_PROGRESS);

        when(planService.createPlan(eq(userId), any(Plan.class))).thenReturn(created);

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.planId").value(100L))
                .andExpect(jsonPath("$.title").value("Q1 Plan"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(planService, times(1)).createPlan(eq(userId), any(Plan.class));
    }

    @Test
    void testCreatePlan_ValidationError_MissingTitle() throws Exception {
        Long userId = 1L;

        // title @NotBlank -> validation should fail
        String invalidBody = """
            { "description": "some desc" }
            """;

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .contentType("application/json")
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                // GlobalExceptionHandler returns a map of field -> message
                .andExpect(jsonPath("$.title", notNullValue()));

        verify(planService, times(0)).createPlan(anyLong(), any(Plan.class));
    }

    @Test
    void testCreatePlan_ServiceThrows() throws Exception {
        Long userId = 2L;

        Plan request = new Plan();
        request.setTitle("Q2 Plan");

        when(planService.createPlan(eq(userId), any(Plan.class)))
                .thenThrow(new RuntimeException("User not found"));

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(planService, times(1)).createPlan(eq(userId), any(Plan.class));
    }

    // ---------------------------
    // GET /api/users/{userId}/plans
    // ---------------------------

    @Test
    void testGetPlansByUser_Success() throws Exception {
        Long userId = 5L;

        Plan p1 = new Plan(); p1.setPlanId(11L); p1.setTitle("U5-P1");
        Plan p2 = new Plan(); p2.setPlanId(12L); p2.setTitle("U5-P2");

        when(planService.getPlansByUserId(userId)).thenReturn(Arrays.asList(p1, p2));

        mockMvc.perform(get("/api/users/{userId}/plans", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].planId").value(11L))
                .andExpect(jsonPath("$[1].planId").value(12L));

        verify(planService, times(1)).getPlansByUserId(userId);
    }

    @Test
    void testGetPlansByUser_Empty() throws Exception {
        Long userId = 7L;

        when(planService.getPlansByUserId(userId)).thenReturn(List.of());

        mockMvc.perform(get("/api/users/{userId}/plans", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));

        verify(planService, times(1)).getPlansByUserId(userId);
    }

    // ---------------------------
    // GET /api/plans/{planId}
    // ---------------------------

    @Test
    void testGetPlanById_Success() throws Exception {
        Long planId = 20L;

        Plan plan = new Plan();
        plan.setPlanId(planId);
        plan.setTitle("Find me");

        when(planService.getPlanById(planId)).thenReturn(plan);

        mockMvc.perform(get("/api/plans/{planId}", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value(20L))
                .andExpect(jsonPath("$.title").value("Find me"));

        verify(planService, times(1)).getPlanById(planId);
    }

    @Test
    void testGetPlanById_NotFound() throws Exception {
        Long planId = 404L;

        when(planService.getPlanById(planId))
                .thenThrow(new RuntimeException("Plan not found"));

        mockMvc.perform(get("/api/plans/{planId}", planId))
                .andExpect(status().isBadRequest());

        verify(planService, times(1)).getPlanById(planId);
    }

    // ---------------------------
    // PUT /api/plans/{planId}
    // ---------------------------

    @Test
    void testUpdatePlan_Success() throws Exception {
        Long planId = 33L;

        Plan update = new Plan();
        update.setTitle("Updated Title");
        update.setStatus(PlanStatus.IN_PROGRESS);

        Plan returned = new Plan();
        returned.setPlanId(planId);
        returned.setTitle("Updated Title");
        returned.setStatus(PlanStatus.IN_PROGRESS);

        when(planService.updatePlan(eq(planId), any(Plan.class))).thenReturn(returned);

        mockMvc.perform(put("/api/plans/{planId}", planId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value(33L))
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        verify(planService, times(1)).updatePlan(eq(planId), any(Plan.class));
    }

    @Test
    void testUpdatePlan_ServiceThrows() throws Exception {
        Long planId = 34L;

        Plan update = new Plan();
        update.setTitle("Something");

        when(planService.updatePlan(eq(planId), any(Plan.class)))
                .thenThrow(new RuntimeException("Plan not found"));

        mockMvc.perform(put("/api/plans/{planId}", planId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());

        verify(planService, times(1)).updatePlan(eq(planId), any(Plan.class));
    }

    // ---------------------------
    // DELETE /api/plans/{planId}
    // ---------------------------

    @Test
    void testDeletePlan_Success() throws Exception {
        Long planId = 77L;

        doNothing().when(planService).deletePlan(planId);

        mockMvc.perform(delete("/api/plans/{planId}", planId))
                .andExpect(status().isNoContent());

        verify(planService, times(1)).deletePlan(planId);
    }

    @Test
    void testDeletePlan_NotFound() throws Exception {
        Long planId = 78L;

        doThrow(new RuntimeException("Plan not found")).when(planService).deletePlan(planId);

        mockMvc.perform(delete("/api/plans/{planId}", planId))
                .andExpect(status().isBadRequest());

        verify(planService, times(1)).deletePlan(planId);
    }

    // ---------------------------
    // GET /api/users/{userId}/assigned-plans
    // ---------------------------

    @Test
    void testGetPlansWithAssignedInitiatives_Success() throws Exception {
        Long userId = 9L;

        Plan p1 = new Plan(); p1.setPlanId(901L); p1.setTitle("Assigned A");
        Plan p2 = new Plan(); p2.setPlanId(902L); p2.setTitle("Assigned B");

        when(planService.getPlansWithAssignedInitiatives(userId)).thenReturn(Arrays.asList(p1, p2));

        mockMvc.perform(get("/api/users/{userId}/assigned-plans", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].planId").value(901L))
                .andExpect(jsonPath("$[1].planId").value(902L));

        verify(planService, times(1)).getPlansWithAssignedInitiatives(userId);
    }

    // ---------------------------
    // GET /api/plans/{planId}/cancel-preview
    // ---------------------------

    @Test
    void testGetCancelPreview_Success() throws Exception {
        Long planId = 111L;

        Map<String, Object> preview = new HashMap<>();
        preview.put("planId", planId);
        preview.put("affectedMilestones", 3);
        preview.put("affectedInitiatives", 5);

        when(planService.getCancelCascadePreview(planId)).thenReturn(preview);

        mockMvc.perform(get("/api/plans/{planId}/cancel-preview", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value(111))
                .andExpect(jsonPath("$.affectedMilestones").value(3))
                .andExpect(jsonPath("$.affectedInitiatives").value(5));

        verify(planService, times(1)).getCancelCascadePreview(planId);
    }

    // ---------------------------
    // POST /api/plans/{planId}/cancel
    // ---------------------------

    @Test
    void testCancelPlanWithCascade_Success() throws Exception {
        Long planId = 222L;

        Map<String, Object> result = Map.of(
                "planId", planId,
                "status", "CANCELLED",
                "cancelledMilestones", 4,
                "cancelledInitiatives", 7
        );

        when(planService.cancelPlanWithCascade(eq(planId), any())).thenReturn(result);

        mockMvc.perform(post("/api/plans/{planId}/cancel", planId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value(222))
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.cancelledMilestones").value(4))
                .andExpect(jsonPath("$.cancelledInitiatives").value(7));

        verify(planService, times(1)).cancelPlanWithCascade(eq(planId), isNull());
    }

    @Test
    void testCancelPlanWithCascade_ServiceThrows() throws Exception {
        Long planId = 333L;

        when(planService.cancelPlanWithCascade(eq(planId), any()))
                .thenThrow(new RuntimeException("Plan already cancelled"));

        mockMvc.perform(post("/api/plans/{planId}/cancel", planId))
                .andExpect(status().isBadRequest());

        verify(planService, times(1)).cancelPlanWithCascade(eq(planId), isNull());
    }
}