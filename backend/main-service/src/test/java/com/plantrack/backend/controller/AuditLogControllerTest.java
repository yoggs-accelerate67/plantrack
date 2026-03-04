package com.plantrack.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.plantrack.backend.exception.GlobalExceptionHandler;
import com.plantrack.backend.model.AuditLog;
import com.plantrack.backend.repository.AuditLogRepository;
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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuditLogControllerTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogController auditLogController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Boot-like ObjectMapper so LocalDateTime (timestamp) serializes reliably
        objectMapper = Jackson2ObjectMapperBuilder.json()
                .modules(new JavaTimeModule())
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();

        MappingJackson2HttpMessageConverter jsonConverter =
                new MappingJackson2HttpMessageConverter(objectMapper);

        mockMvc = MockMvcBuilders
                .standaloneSetup(auditLogController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(jsonConverter)
                .build();
    }

    private AuditLog makeLog(long id, String action, String user, String type, Long entityId, String details, LocalDateTime ts) {
        AuditLog log = new AuditLog();
        log.setId(id);
        log.setAction(action);
        log.setPerformedBy(user);
        log.setEntityType(type);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setTimestamp(ts);
        return log;
    }

    // -----------------------------------------
    // GET /api/audit-logs
    // -----------------------------------------

    @Test
    void testGetAllAuditLogs_Success() throws Exception {
        AuditLog l1 = makeLog(1L, "CREATE", "alice@corp.com", "PLAN", 10L, "Created plan", LocalDateTime.of(2026,1,1,10,0));
        AuditLog l2 = makeLog(2L, "UPDATE", "bob@corp.com", "MILESTONE", 20L, "Updated title", LocalDateTime.of(2026,1,2,11,30));

        when(auditLogRepository.findAll()).thenReturn(Arrays.asList(l1, l2));

        mockMvc.perform(get("/api/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].action").value("CREATE"))
                .andExpect(jsonPath("$[0].performedBy").value("alice@corp.com"))
                .andExpect(jsonPath("$[0].timestamp", notNullValue()))
                .andExpect(jsonPath("$[1].id").value(2L));
        
        verify(auditLogRepository, times(1)).findAll();
    }

    @Test
    void testGetAllAuditLogs_Empty() throws Exception {
        when(auditLogRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));

        verify(auditLogRepository, times(1)).findAll();
    }

    @Test
    void testGetAllAuditLogs_RepoThrows() throws Exception {
        when(auditLogRepository.findAll()).thenThrow(new RuntimeException("DB down"));

        mockMvc.perform(get("/api/audit-logs"))
                .andExpect(status().isBadRequest()); // mapped by GlobalExceptionHandler

        verify(auditLogRepository, times(1)).findAll();
    }

    // -----------------------------------------
    // GET /api/audit-logs/entity/{entityType}
    // -----------------------------------------

    @Test
    void testGetByEntityType_Success() throws Exception {
        String entityType = "PLAN";
        AuditLog l = makeLog(3L, "DELETE", "eve@corp.com", entityType, 15L, "Removed plan", LocalDateTime.of(2026,1,3,9,0));

        when(auditLogRepository.findByEntityTypeOrderByTimestampDesc(entityType))
                .thenReturn(List.of(l));

        mockMvc.perform(get("/api/audit-logs/entity/{entityType}", entityType))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].entityType").value("PLAN"))
                .andExpect(jsonPath("$[0].id").value(3L));

        verify(auditLogRepository, times(1)).findByEntityTypeOrderByTimestampDesc(entityType);
    }

    // -----------------------------------------
    // GET /api/audit-logs/user/{performedBy}
    // -----------------------------------------

    @Test
    void testGetByUser_Success() throws Exception {
        String user = "bob@corp.com";
        AuditLog l = makeLog(4L, "UPDATE", user, "INITIATIVE", 33L, "Changed status", LocalDateTime.of(2026,1,4,8,15));

        when(auditLogRepository.findByPerformedByOrderByTimestampDesc(user))
                .thenReturn(List.of(l));

        mockMvc.perform(get("/api/audit-logs/user/{performedBy}", user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].performedBy").value("bob@corp.com"))
                .andExpect(jsonPath("$[0].id").value(4L));

        verify(auditLogRepository, times(1)).findByPerformedByOrderByTimestampDesc(user);
    }

    // -----------------------------------------
    // GET /api/audit-logs/action/{action}
    // -----------------------------------------

    @Test
    void testGetByAction_Success() throws Exception {
        String action = "UPDATE_STATUS";
        AuditLog l = makeLog(5L, action, "alice@corp.com", "MILESTONE", 44L, "In progress -> completed", LocalDateTime.of(2026,1,5,7,0));

        when(auditLogRepository.findByActionOrderByTimestampDesc(action))
                .thenReturn(List.of(l));

        mockMvc.perform(get("/api/audit-logs/action/{action}", action))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].action").value("UPDATE_STATUS"))
                .andExpect(jsonPath("$[0].id").value(5L));

        verify(auditLogRepository, times(1)).findByActionOrderByTimestampDesc(action);
    }

    // -----------------------------------------
    // GET /api/audit-logs/entity/{entityType}/{entityId}
    // -----------------------------------------

    @Test
    void testGetByEntity_Success() throws Exception {
        String entityType = "MILESTONE";
        Long entityId = 55L;
        AuditLog l = makeLog(6L, "CREATE", "carol@corp.com", entityType, entityId, "Created milestone", LocalDateTime.of(2026,1,6,6,0));

        when(auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId))
                .thenReturn(List.of(l));

        mockMvc.perform(get("/api/audit-logs/entity/{entityType}/{entityId}", entityType, entityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].entityType").value("MILESTONE"))
                .andExpect(jsonPath("$[0].entityId").value(55))
                .andExpect(jsonPath("$[0].id").value(6L));

        verify(auditLogRepository, times(1)).findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    // -----------------------------------------
    // GET /api/audit-logs/date-range?startDate&endDate
    // -----------------------------------------

    @Test
    void testGetByDateRange_Success() throws Exception {
        LocalDateTime start = LocalDateTime.of(2026, 1, 1, 0, 0, 0);
        LocalDateTime end   = LocalDateTime.of(2026, 1, 31, 23, 59, 59);

        AuditLog l1 = makeLog(7L, "CREATE", "a@corp.com", "PLAN", 1L, "X", LocalDateTime.of(2026,1,10,12,0));
        AuditLog l2 = makeLog(8L, "DELETE", "b@corp.com", "USER", 2L, "Y", LocalDateTime.of(2026,1,20,12,0));

        when(auditLogRepository.findByTimestampBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(l1, l2));

        mockMvc.perform(get("/api/audit-logs/date-range")
                        .param("startDate", "2026-01-01T00:00:00")
                        .param("endDate", "2026-01-31T23:59:59"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].id").value(7L))
                .andExpect(jsonPath("$[1].id").value(8L));

        // Verify parsed dates forwarded to repository
        ArgumentCaptor<LocalDateTime> startCap = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> endCap = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(auditLogRepository, times(1)).findByTimestampBetween(startCap.capture(), endCap.capture());

        org.junit.jupiter.api.Assertions.assertEquals(start, startCap.getValue());
        org.junit.jupiter.api.Assertions.assertEquals(end, endCap.getValue());
    }

    @Test
    void testGetByDateRange_MissingParam_BadRequest() throws Exception {
        // Missing endDate -> MissingServletRequestParameterException -> 400 via advice
        mockMvc.perform(get("/api/audit-logs/date-range")
                        .param("startDate", "2026-01-01T00:00:00"))
                .andExpect(status().isBadRequest());

        verify(auditLogRepository, never()).findByTimestampBetween(any(), any());
    }

    @Test
    void testGetByDateRange_InvalidFormat_BadRequest() throws Exception {
        // Invalid startDate -> type conversion fails -> 400 via advice
        mockMvc.perform(get("/api/audit-logs/date-range")
                        .param("startDate", "2026/01/01 00:00:00")
                        .param("endDate", "2026-01-31T23:59:59"))
                .andExpect(status().isBadRequest());

        verify(auditLogRepository, never()).findByTimestampBetween(any(), any());
    }

    // -----------------------------------------
    // GET /api/audit-logs/user/{performedBy}/date-range
    // -----------------------------------------

    @Test
    void testGetByUserAndDateRange_Success() throws Exception {
        String user = "dave@corp.com";
        LocalDateTime start = LocalDateTime.of(2026, 2, 1, 0, 0);
        LocalDateTime end   = LocalDateTime.of(2026, 2, 28, 23, 59, 59);

        AuditLog l = makeLog(9L, "UPDATE", user, "INITIATIVE", 9L, "Changed desc", LocalDateTime.of(2026,2,10,8,0));

        when(auditLogRepository.findByPerformedByAndTimestampBetween(eq(user), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(l));

        mockMvc.perform(get("/api/audit-logs/user/{performedBy}/date-range", user)
                        .param("startDate", "2026-02-01T00:00:00")
                        .param("endDate", "2026-02-28T23:59:59"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].performedBy").value("dave@corp.com"))
                .andExpect(jsonPath("$[0].id").value(9L));

        ArgumentCaptor<LocalDateTime> sCap = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> eCap = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(auditLogRepository, times(1))
                .findByPerformedByAndTimestampBetween(eq(user), sCap.capture(), eCap.capture());

        org.junit.jupiter.api.Assertions.assertEquals(start, sCap.getValue());
        org.junit.jupiter.api.Assertions.assertEquals(end, eCap.getValue());
    }

    @Test
    void testGetByUserAndDateRange_MissingParam_BadRequest() throws Exception {
        String user = "someone@corp.com";

        mockMvc.perform(get("/api/audit-logs/user/{performedBy}/date-range", user)
                        .param("startDate", "2026-03-01T00:00:00"))
                .andExpect(status().isBadRequest());

        verify(auditLogRepository, never()).findByPerformedByAndTimestampBetween(any(), any(), any());
    }
}