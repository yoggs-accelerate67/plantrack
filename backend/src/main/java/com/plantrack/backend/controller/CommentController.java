package com.plantrack.backend.controller;

import com.plantrack.backend.model.Comment;
import com.plantrack.backend.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Add a comment to an Initiative
    // URL: POST /api/initiatives/1/comments?userId=1
    @PostMapping("/initiatives/{initiativeId}/comments")
    public Comment addComment(@PathVariable Long initiativeId, 
                              @RequestParam Long userId, 
                              @Valid @RequestBody Comment comment) {
        return commentService.addComment(initiativeId, userId, comment);
    }

    // Get all comments for an Initiative
    @GetMapping("/initiatives/{initiativeId}/comments")
    public List<Comment> getCommentsByInitiative(@PathVariable Long initiativeId) {
        return commentService.getCommentsByInitiative(initiativeId);
    }
}