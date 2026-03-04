package com.plantrack.backend.service;

import com.plantrack.backend.model.Comment;

import java.util.List;

public interface CommentService {

    public Comment createComment(Long initiativeId, Comment comment);
    public List<Comment> getCommentsByInitiative(Long initiativeId);
    public Comment updateComment(Long commentId, Comment updatedComment);
    public void deleteComment(Long commentId);

}
