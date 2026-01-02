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
  template: `
    <div class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
      <!-- Collapsible Header - Always Visible -->
      <div 
        (click)="toggleComments()"
        class="flex items-center justify-between cursor-pointer p-2 -m-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Comments</span>
          <span *ngIf="comments().length > 0" class="px-2 py-0.5 bg-teal-600 text-white text-xs font-medium rounded-full min-w-[20px] text-center">{{ comments().length }}</span>
          <span *ngIf="comments().length === 0" class="text-xs text-slate-400">(none)</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-xs text-slate-400">{{ isExpanded() ? 'Hide' : 'View' }}</span>
          <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" [class.rotate-180]="isExpanded()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Expandable Content -->
      <div *ngIf="isExpanded()" class="mt-4">
        <!-- Add Comment Button -->
        <div *ngIf="canComment() && !showCommentForm()" class="mb-3">
          <button
            (click)="showCommentForm.set(true)"
            class="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Comment</span>
          </button>
        </div>

      <!-- Comment Form -->
      <div *ngIf="showCommentForm()" class="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
        <div class="relative mb-3">
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Write a comment
            <span class="text-slate-400">(Use &#64; to mention users)</span>
          </label>
          <textarea
            #commentInput
            [(ngModel)]="newComment.content"
            (input)="onCommentInput($event)"
            (keydown)="onCommentKeydown($event)"
            (focus)="onCommentFocus()"
            (blur)="onCommentBlur()"
            rows="3"
            maxlength="2000"
            class="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 resize-none text-sm"
            placeholder="Type your comment here... Use &#64;username to mention someone"
          ></textarea>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-slate-500 dark:text-slate-400">{{ newComment.content.length }}/2000 characters</span>
          </div>
          <div *ngIf="showMentionDropdown()" class="absolute z-50 bottom-full mb-2 left-0 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
            <div *ngIf="filteredMentionUsers().length === 0" class="p-3 text-center text-sm text-slate-500">No users found</div>
            <div *ngFor="let user of filteredMentionUsers(); let i = index"
              (click)="selectMentionUser(user)"
              (mouseenter)="selectedMentionIndex.set(i)"
              class="w-full px-3 py-2 text-left transition-colors flex items-center space-x-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              [ngClass]="{'bg-teal-100 dark:bg-teal-900': selectedMentionIndex() === i}">
              <div class="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">{{ getUserInitial(user.name) }}</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{{ user.name }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end space-x-2">
          <button type="button" (click)="cancelComment()" class="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          <button type="button" (click)="submitComment()" [disabled]="!newComment.content || newComment.content.trim().length === 0" class="px-3 py-1.5 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Post Comment</button>
        </div>
      </div>

      <!-- Comments List -->
      <div *ngIf="loadingComments()" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
      </div>

      <div *ngIf="!loadingComments() && comments().length === 0" class="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
        <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>No comments yet</p>
        <button *ngIf="canComment()" (click)="showCommentForm.set(true)" class="mt-2 text-teal-600 hover:text-teal-700 text-xs font-medium">Be the first to comment →</button>
      </div>

      <div *ngIf="!loadingComments() && comments().length > 0" class="space-y-3 max-h-96 overflow-y-auto">
        <div *ngFor="let comment of comments()" class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 group">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">{{ getAuthorInitial(comment) }}</div>
              <div>
                <div class="text-xs font-medium text-slate-900 dark:text-slate-100">{{ comment.author?.name || 'Unknown' }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">{{ formatRelativeTime(comment.createdAt) }}</div>
              </div>
            </div>
            <div *ngIf="canEditComment(comment)" class="flex items-center space-x-1">
              <ng-container *ngIf="editingCommentId() === comment.commentId">
                <button (click)="cancelEdit()" class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Cancel">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <button (click)="saveEdit(comment)" class="p-1 text-teal-600 hover:text-teal-700 transition-colors" title="Save">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                </button>
              </ng-container>
              <ng-container *ngIf="editingCommentId() !== comment.commentId">
                <button (click)="startEdit(comment)" class="p-1 text-slate-400 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button (click)="deleteComment(comment.commentId!)" class="p-1 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </ng-container>
            </div>
          </div>
          <textarea *ngIf="editingCommentId() === comment.commentId" [(ngModel)]="editingCommentContent" rows="3" maxlength="2000" class="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm resize-none"></textarea>
          <ng-container *ngIf="editingCommentId() !== comment.commentId">
            <div class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{{ comment.content }}</div>
            <div *ngIf="comment.mentionedUsers && comment.mentionedUsers.length > 0" class="mt-2 flex flex-wrap gap-1">
              <span *ngFor="let user of comment.mentionedUsers" class="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded text-xs">&#64;{{ getUserDisplayName(user) }}</span>
            </div>
          </ng-container>
        </div>
      </div>
      </div>
    </div>
  `,
  styles: []
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

