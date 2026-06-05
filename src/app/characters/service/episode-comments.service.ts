import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../user/service/info-user.service';

export interface EpisodeComment {
  id: string;
  episodeId: number;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
    photoUrl?: string;
  };
}

interface ApiResponse {
  header: {
    message: string;
    resultCode: number;
  };
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class EpisodeCommentsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly BASE_URL = `${environment.apiUrl}/episode-comments`;

  getCommentsByEpisode(episodeId: number): Observable<EpisodeComment[]> {
    return this.http
      .get<ApiResponse>(`${this.BASE_URL}/episode/${episodeId}`, {
        headers: this.createAuthHeaders(),
      })
      .pipe(
        map((response) => {
          const data = response['data'] || response;
          const comments = Array.isArray(data['comments']) ? data['comments'] : [];
          return comments.map((comment: any) => this.mapComment(comment));
        }),
      );
  }

  createComment(episodeId: number, content: string): Observable<EpisodeComment> {
    return this.http
      .post<ApiResponse>(
        this.BASE_URL,
        { episodeId, content },
        { headers: this.createAuthHeaders() },
      )
      .pipe(map((response) => this.mapComment(this.extractComment(response))));
  }

  updateComment(commentId: string, content: string): Observable<EpisodeComment> {
    return this.http
      .put<ApiResponse>(
        `${this.BASE_URL}/${commentId}`,
        { content },
        { headers: this.createAuthHeaders() },
      )
      .pipe(map((response) => this.mapComment(this.extractComment(response))));
  }

  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${commentId}`, {
      headers: this.createAuthHeaders(),
    });
  }

  toggleCommentSettings(episodeId: number, enabled: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.BASE_URL}/settings/${episodeId}`,
      { commentsEnabled: enabled },
      { headers: this.createAuthHeaders() },
    );
  }

  /** Normaliza un comentario crudo del backend al modelo EpisodeComment. */
  private mapComment(comment: any): EpisodeComment {
    return {
      id: comment.id,
      episodeId: comment.episodeId,
      userId: comment.userId,
      content: comment.content,
      createdAt: new Date(comment.createdAt),
      updatedAt: new Date(comment.updatedAt),
      user: {
        name: comment.user.name,
        photoUrl: comment.user.photoUrl ?? '',
      },
    };
  }

  /** Obtiene el comentario de la respuesta (sea plano o dentro de data). */
  private extractComment(response: ApiResponse): any {
    const comment = response['comment'] || response['data']?.['comment'];
    if (!comment) {
      throw new Error('No comment in response');
    }
    return comment;
  }

  private createAuthHeaders(): HttpHeaders {
    const user = this.authService.user;
    if (!user?.token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'auth-token': user.token,
    });
  }
}
