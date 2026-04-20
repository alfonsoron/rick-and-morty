import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../user/service/info-user.service';
import { EpisodeCommentsService, EpisodeComment } from '../../service/episode-comments.service';
import { User } from '../../../user/interfaces/user';
import { EpisodeInterface } from '../../interface/character.inteface';

@Component({
  selector: 'app-episode-comments',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './episode-comments.html',
})
export class EpisodeComments implements OnInit, OnChanges {
  private authService = inject(AuthService);
  private commentsService = inject(EpisodeCommentsService);
  private fb = inject(FormBuilder);

  episode = input<EpisodeInterface | null>(null);

  comments = signal<EpisodeComment[]>([]);
  commentsEnabled = signal(true);
  editingCommentId = signal<string | null>(null);

  currentUser = computed(() => this.authService.user);
  isAdmin = computed(() => this.isAdminUser(this.currentUser()));

  commentForm = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    this.loadComments();
  }

  ngOnChanges(): void {
    this.loadComments();
    this.cancelEdit();
  }

  loadComments(): void {
    const episodeId = this.episode()?.id;
    if (!episodeId) {
      this.comments.set([]);
      this.commentsEnabled.set(true);
      return;
    }

    this.commentsService.getCommentsByEpisode(episodeId).subscribe({
      next: (comments) => {
        this.comments.set(
          comments.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
        );
      },
      error: () => {
        this.comments.set([]);
      },
    });
    this.commentsEnabled.set(true);
  }

  canAddComments(): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (this.isAdmin()) return true;

    return this.commentsEnabled();
  }

  canEditComment(comment: EpisodeComment): boolean {
    const user = this.currentUser();
    return !!user && comment.userId === user.id;
  }

  canDeleteComment(comment: EpisodeComment): boolean {
    const user = this.currentUser();
    if (!user) return false;

    return this.isAdmin() || comment.userId === user.id;
  }

  submitComment(): void {
    const user = this.currentUser();
    const episodeId = this.episode()?.id;

    if (!user || !episodeId || this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const content = this.commentForm.value.content?.trim();
    if (!content) return;

    if (!this.isAdmin() && !this.commentsEnabled()) {
      return;
    }

    const editingId = this.editingCommentId();
    this.cancelEdit();

    if (editingId) {
      this.commentsService.updateComment(editingId, content).subscribe({
        next: () => {
          this.loadComments();
        },
        error: (error) => {
          console.error('Error updating comment:', error);
        },
      });
    } else {
      this.commentsService.createComment(episodeId, content).subscribe({
        next: () => {
          this.loadComments();
        },
        error: (error) => {
          console.error('Error adding comment:', error);
        },
      });
    }
  }

  startEdit(comment: EpisodeComment): void {
    if (!this.canEditComment(comment)) return;

    this.editingCommentId.set(comment.id);
    this.commentForm.patchValue({
      content: comment.content,
    });
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
    this.commentForm.reset({
      content: '',
    });
  }

  deleteComment(comment: EpisodeComment): void {
    if (!this.canDeleteComment(comment)) return;

    if (this.editingCommentId() === comment.id) {
      this.cancelEdit();
    }

    this.commentsService.deleteComment(comment.id).subscribe({
      next: () => {
        this.loadComments();
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
      },
    });
  }

  toggleCommentsEnabled(): void {
    if (!this.isAdmin() || !this.episode()?.id) return;

    const nextState = !this.commentsEnabled();
    this.commentsService.toggleCommentSettings(this.episode()!.id, nextState).subscribe({
      next: () => {
        this.commentsEnabled.set(nextState);
      },
      error: (error) => {
        console.error('Error toggling comments:', error);
      },
    });
  }

  private isAdminUser(user: User | null): boolean {
    return user?.role?.toLowerCase() === 'admin';
  }
}
