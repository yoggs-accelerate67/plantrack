import { Component, Input, Output, EventEmitter, OnInit, signal, computed, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Comment } from '../../models/plan.model';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
})
export class CommentsComponent implements OnInit {
  @Input() initiativeId!: number;
  @Output() commentAdded = new EventEmitter<void>();
  @ViewChild('commentInput') commentInput?: ElementRef<HTMLTextAreaElement>;

  comments = signal<Comment[]>([]);
  loadingComments = signal(false);
  showCommentForm = signal(false);
  newComment: Comment = { content: '' };
  
  // Mention autocomplete
  showMentionDropdown = signal(false);
  mentionQuery = signal('');
  mentionStartIndex = signal(-1);
  selectedMentionIndex = signal(0);
  users = signal<User[]>([]);
  loadingUsers = signal(false);

  // Edit state
  editingCommentId = signal<number | null>(null);
  editingCommentContent = '';

  // Collapse/Expand state
  isExpanded = signal(false);

  filteredMentionUsers = computed(() => {
    const query = this.mentionQuery().toLowerCase().trim();
    if (!query) {
      return this.users().slice(0, 10); // Limit to 10 users
    }
    return this.users().filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query)
    ).slice(0, 10);
  });

  constructor(
    private commentService: CommentService,
    private userService: UserService,
    public authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Load comment count on init (for badge), but don't load full comments until expanded
    this.loadCommentCount();
    this.loadUsers();
  }

  loadCommentCount(): void {
    // Load comments to show count in the badge
    this.commentService.getComments(this.initiativeId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
      },
      error: (error) => {
        console.error('Failed to load comment count:', error);
      }
    });
  }

  canComment(): boolean {
    // Managers, admins, and assigned users can comment
    return this.authService.isManager() || this.authService.isAdmin() || this.authService.isEmployee();
  }

  toggleComments(): void {
    this.isExpanded.set(!this.isExpanded());
    // Load comments when expanding for the first time
    if (this.isExpanded() && this.comments().length === 0 && !this.loadingComments()) {
      this.loadComments();
    }
  }

  canEditComment(comment: Comment): boolean {
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) return false;
    
    // Author can edit
    if (comment.author?.userId === currentUserId) {
      return true;
    }
    
    // Managers and admins can edit
    return this.authService.isManager() || this.authService.isAdmin();
  }

  loadComments(): void {
    this.loadingComments.set(true);
    this.commentService.getComments(this.initiativeId).subscribe({
      next: (comments) => {
        this.comments.set(comments);
        this.loadingComments.set(false);
      },
      error: (error) => {
        console.error('Failed to load comments:', error);
        this.loadingComments.set(false);
        this.toastService.showError('Failed to load comments');
      }
    });
  }

  loadUsers(): void {
    if (this.users().length > 0) return;
    
    this.loadingUsers.set(true);
    // Use the mentions endpoint which is accessible by all authenticated users
    this.userService.getUsersForMentions().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
      },
      error: (error) => {
        console.error('Failed to load users for mentions:', error);
        this.loadingUsers.set(false);
      }
    });
  }

  onCommentInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const cursorPos = textarea.selectionStart;

    // Check for @mention
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      this.mentionStartIndex.set(cursorPos - mentionMatch[0].length);
      this.mentionQuery.set(mentionMatch[1]);
      this.showMentionDropdown.set(true);
      this.selectedMentionIndex.set(0);
    } else {
      this.showMentionDropdown.set(false);
    }
  }

  onCommentKeydown(event: KeyboardEvent): void {
    if (!this.showMentionDropdown()) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const maxIndex = this.filteredMentionUsers().length - 1;
      this.selectedMentionIndex.set(Math.min(this.selectedMentionIndex() + 1, maxIndex));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedMentionIndex.set(Math.max(this.selectedMentionIndex() - 1, 0));
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const selectedUser = this.filteredMentionUsers()[this.selectedMentionIndex()];
      if (selectedUser) {
        this.selectMentionUser(selectedUser);
      }
    } else if (event.key === 'Escape') {
      this.showMentionDropdown.set(false);
    }
  }

  onCommentFocus(): void {
    // Keep mention dropdown logic
  }

  onCommentBlur(): void {
    // Delay to allow click on dropdown
    setTimeout(() => {
      this.showMentionDropdown.set(false);
    }, 200);
  }

  selectMentionUser(user: User): void {
    if (!this.commentInput) return;

    const textarea = this.commentInput.nativeElement;
    const value = textarea.value;
    const startPos = this.mentionStartIndex();
    const endPos = textarea.selectionStart;
    
    // Get username from email (part before @)
    const username = user.email?.split('@')[0] || user.name?.toLowerCase().replace(/\s+/g, '') || 'user';
    
    // Replace @mention with @username
    const newValue = value.substring(0, startPos) + '@' + username + ' ' + value.substring(endPos);
    this.newComment.content = newValue;
    
    // Move cursor after the mention
    setTimeout(() => {
      const newCursorPos = startPos + username.length + 2; // +2 for @ and space
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);

    this.showMentionDropdown.set(false);
    this.mentionQuery.set('');
  }

  submitComment(): void {
    if (!this.newComment.content || this.newComment.content.trim().length === 0) {
      return;
    }

    this.commentService.createComment(this.initiativeId, this.newComment).subscribe({
      next: () => {
        this.toastService.showSuccess('Comment posted successfully!');
        this.newComment = { content: '' };
        this.showCommentForm.set(false);
        this.loadComments();
        this.commentAdded.emit();
      },
      error: (error) => {
        console.error('Failed to post comment:', error);
        this.toastService.showError(error.error?.message || 'Failed to post comment');
      }
    });
  }

  cancelComment(): void {
    this.newComment = { content: '' };
    this.showCommentForm.set(false);
    this.showMentionDropdown.set(false);
  }

  startEdit(comment: Comment): void {
    this.editingCommentId.set(comment.commentId!);
    this.editingCommentContent = comment.content;
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editingCommentContent = '';
  }

  saveEdit(comment: Comment): void {
    if (!this.editingCommentContent || this.editingCommentContent.trim().length === 0) {
      return;
    }

    const updatedComment: Comment = {
      ...comment,
      content: this.editingCommentContent
    };

    this.commentService.updateComment(comment.commentId!, updatedComment).subscribe({
      next: () => {
        this.toastService.showSuccess('Comment updated successfully!');
        this.cancelEdit();
        this.loadComments();
      },
      error: (error) => {
        console.error('Failed to update comment:', error);
        this.toastService.showError(error.error?.message || 'Failed to update comment');
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.toastService.showSuccess('Comment deleted successfully!');
        this.loadComments();
      },
      error: (error) => {
        console.error('Failed to delete comment:', error);
        this.toastService.showError(error.error?.message || 'Failed to delete comment');
      }
    });
  }


  formatRelativeTime(dateString?: string): string {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    } catch {
      return dateString;
    }
  }

  getUserDisplayName(user: { name?: string; email?: string }): string {
    if (user.email) {
      return user.email.split('@')[0];
    }
    return user.name || 'user';
  }

  getUserInitial(name: string | undefined): string {
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getAuthorInitial(comment: Comment): string {
    if (comment.author?.name && comment.author.name.length > 0) {
      return comment.author.name.charAt(0).toUpperCase();
    }
    return 'U';
  }

  splitCommentContent(content: string): string[] {
    if (!content) return [];
    
    // Split by @mentions while preserving the @mention text
    const parts: string[] = [];
    const mentionRegex = /@(\w+)/g;
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      // Add mention
      parts.push(match[0]);
      lastIndex = mentionRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
  }

  isMention(part: string): boolean {
    return !!(part && part.length > 0 && part.charAt(0) === '@');
  }
}

