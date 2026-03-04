package com.plantrack.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.plantrack.backend.exception.GlobalExceptionHandler;
import com.plantrack.backend.model.Comment;
import com.plantrack.backend.service.CommentService;
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
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CommentControllerTest {

    @Mock
    private CommentService commentService;

    @InjectMocks
    private CommentController commentController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Boot-like ObjectMapper (JavaTimeModule + ISO date/time)
        objectMapper = Jackson2ObjectMapperBuilder.json()
                .modules(new JavaTimeModule())
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();

        MappingJackson2HttpMessageConverter jsonConverter =
                new MappingJackson2HttpMessageConverter(objectMapper);

        mockMvc = MockMvcBuilders
                .standaloneSetup(commentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(jsonConverter)
                .build();
    }

    // -------------------------------------------------
    // POST /api/initiatives/{initiativeId}/comments
    // -------------------------------------------------

    @Test
    void testCreateComment_Success() throws Exception {
        Long initiativeId = 10L;

        Comment request = new Comment();
        request.setContent("Looks good to me!");

        Comment created = new Comment();
        created.setCommentId(1001L);
        created.setContent("Looks good to me!");
        created.setCreatedAt(LocalDateTime.of(2026, 3, 31, 10, 0, 0));
        created.setUpdatedAt(LocalDateTime.of(2026, 3, 31, 10, 0, 0));
        created.setDeleted(false);

        when(commentService.createComment(eq(initiativeId), any(Comment.class)))
                .thenReturn(created);

        mockMvc.perform(post("/api/initiatives/{initiativeId}/comments", initiativeId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                // Controller returns Comment directly -> default 200 OK
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentId").value(1001L))
                .andExpect(jsonPath("$.content").value("Looks good to me!"))
                .andExpect(jsonPath("$.deleted").value(false));

        verify(commentService, times(1)).createComment(eq(initiativeId), any(Comment.class));
    }

    @Test
    void testCreateComment_ValidationError_MissingContent() throws Exception {
        Long initiativeId = 11L;

        // content is @NotBlank -> expect MethodArgumentNotValidException -> 400 with field map
        String invalidBody = """
            { "content": "   " }
            """;

        mockMvc.perform(post("/api/initiatives/{initiativeId}/comments", initiativeId)
                        .contentType("application/json")
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.content", notNullValue()));

        verify(commentService, never()).createComment(anyLong(), any(Comment.class));
    }

    @Test
    void testCreateComment_ServiceThrows() throws Exception {
        Long initiativeId = 12L;

        Comment request = new Comment();
        request.setContent("Will refactor after code review.");

        when(commentService.createComment(eq(initiativeId), any(Comment.class)))
                .thenThrow(new RuntimeException("Initiative not found"));

        mockMvc.perform(post("/api/initiatives/{initiativeId}/comments", initiativeId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(commentService, times(1)).createComment(eq(initiativeId), any(Comment.class));
    }

    // -------------------------------------------------
    // GET /api/initiatives/{initiativeId}/comments
    // -------------------------------------------------

    @Test
    void testGetComments_Success() throws Exception {
        Long initiativeId = 21L;

        Comment c1 = new Comment();
        c1.setCommentId(201L);
        c1.setContent("First!");
        c1.setCreatedAt(LocalDateTime.of(2026, 1, 1, 9, 0));

        Comment c2 = new Comment();
        c2.setCommentId(202L);
        c2.setContent("LGTM");
        c2.setCreatedAt(LocalDateTime.of(2026, 1, 2, 10, 0));

        when(commentService.getCommentsByInitiative(initiativeId))
                .thenReturn(Arrays.asList(c1, c2));

        mockMvc.perform(get("/api/initiatives/{initiativeId}/comments", initiativeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(2)))
                .andExpect(jsonPath("$[0].commentId").value(201L))
                .andExpect(jsonPath("$[0].content").value("First!"))
                .andExpect(jsonPath("$[1].commentId").value(202L))
                .andExpect(jsonPath("$[1].content").value("LGTM"));

        verify(commentService, times(1)).getCommentsByInitiative(initiativeId);
    }

    @Test
    void testGetComments_Empty() throws Exception {
        Long initiativeId = 22L;

        when(commentService.getCommentsByInitiative(initiativeId))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/initiatives/{initiativeId}/comments", initiativeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(0)));

        verify(commentService, times(1)).getCommentsByInitiative(initiativeId);
    }

    // -------------------------------------------------
    // PUT /api/comments/{commentId}
    // -------------------------------------------------

    @Test
    void testUpdateComment_Success() throws Exception {
        Long commentId = 301L;

        Comment update = new Comment();
        update.setContent("Updated after review.");

        Comment returned = new Comment();
        returned.setCommentId(commentId);
        returned.setContent("Updated after review.");
        returned.setUpdatedAt(LocalDateTime.of(2026, 2, 1, 12, 0));

        when(commentService.updateComment(eq(commentId), any(Comment.class)))
            .thenReturn(returned);

        mockMvc.perform(put("/api/comments/{commentId}", commentId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentId").value(301L))
                .andExpect(jsonPath("$.content").value("Updated after review."));

        verify(commentService, times(1)).updateComment(eq(commentId), any(Comment.class));
    }

    @Test
    void testUpdateComment_ValidationError_MissingContent() throws Exception {
        Long commentId = 302L;

        String invalidBody = """
            { "content": "" }
            """;

        mockMvc.perform(put("/api/comments/{commentId}", commentId)
                        .contentType("application/json")
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.content", notNullValue()));

        verify(commentService, never()).updateComment(anyLong(), any(Comment.class));
    }

    @Test
    void testUpdateComment_ServiceThrows() throws Exception {
        Long commentId = 303L;

        Comment update = new Comment();
        update.setContent("Ping");

        when(commentService.updateComment(eq(commentId), any(Comment.class)))
                .thenThrow(new RuntimeException("Comment not found"));

        mockMvc.perform(put("/api/comments/{commentId}", commentId)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isBadRequest());

        verify(commentService, times(1)).updateComment(eq(commentId), any(Comment.class));
    }

    // -------------------------------------------------
    // DELETE /api/comments/{commentId}
    // -------------------------------------------------

    @Test
    void testDeleteComment_Success() throws Exception {
        Long commentId = 401L;

        doNothing().when(commentService).deleteComment(commentId);

        mockMvc.perform(delete("/api/comments/{commentId}", commentId))
                // Controller method returns void -> default 200 OK
                .andExpect(status().isOk());

        verify(commentService, times(1)).deleteComment(commentId);
    }

    @Test
    void testDeleteComment_ServiceThrows() throws Exception {
        Long commentId = 402L;

        doThrow(new RuntimeException("Cannot delete")).when(commentService).deleteComment(commentId);

        mockMvc.perform(delete("/api/comments/{commentId}", commentId))
                .andExpect(status().isBadRequest());

        verify(commentService, times(1)).deleteComment(commentId);
    }
}