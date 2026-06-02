import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FeedPost, feedPosts } from '../../data/mvp-data';
import { deletePostComment, loadPostComments, PostComment, savePostComments } from '../../data/comments-store';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
})
export class PostDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  post?: FeedPost;
  comments: PostComment[] = [];
  novoComentario = '';
  feedback = '';
  isAdmin = false;
  openAdminCommentId: number | null = null;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isAdmin = this.auth.isAdmin();
    this.post = this.loadPosts().find(item => item.id === id);
    const currentName = this.auth.getCurrentUser()?.nome || 'Participante Hipatec';
    const loadedComments = loadPostComments(id);
    this.comments = loadedComments.map(comment => comment.autora === 'Você' ? { ...comment, autora: currentName } : comment);
    if (loadedComments.some(comment => comment.autora === 'Você')) {
      savePostComments(id, this.comments);
    }
  }

  curtir() {
    if (!this.post) {
      return;
    }

    this.post.liked = !this.post.liked;
    this.post.curtidas += this.post.liked ? 1 : -1;
    this.savePost(this.post);
  }

  compartilhar() {
    this.feedback = 'Link da publicação pronto para compartilhar.';
  }

  salvar() {
    if (!this.post) {
      return;
    }

    this.post.saved = !this.post.saved;
    this.feedback = this.post.saved ? 'Publicação salva.' : 'Publicação removida dos salvos.';
    this.savePost(this.post);
  }

  publicarComentario() {
    if (!this.post) {
      return;
    }

    const texto = this.novoComentario.trim();
    if (!texto) {
      this.feedback = 'Escreva um comentário antes de publicar.';
      return;
    }

    const comment: PostComment = {
      id: Date.now(),
      autora: this.auth.getCurrentUser()?.nome || 'Participante Hipatec',
      texto,
      data: 'agora',
    };

    this.comments = [comment, ...this.comments];
    this.novoComentario = '';
    this.post.comentarios = this.comments.length;
    this.savePost(this.post);
    savePostComments(this.post.id, this.comments);
    this.feedback = 'Comentário publicado.';
  }



  toggleAdminCommentMenu(commentId: number, event: Event) {
    event.stopPropagation();
    this.openAdminCommentId = this.openAdminCommentId === commentId ? null : commentId;
  }

  excluirComentario(comment: PostComment) {
    if (!this.post) {
      return;
    }

    this.comments = deletePostComment(this.post.id, comment.id);
    this.post.comentarios = this.comments.length;
    this.savePost(this.post);
    this.feedback = 'Comentário excluído pela moderação.';
    this.openAdminCommentId = null;
  }

  bloquearUsuario(comment: PostComment, duracao: '1 dia' | '1 semana' | '1 mês' | 'pra sempre') {
    this.saveAdminModerationAction('hipatec_admin_user_blocks', {
      usuario: comment.autora,
      duracao,
      criadoEm: new Date().toISOString(),
    });
    this.feedback = `${comment.autora} bloqueada por ${duracao}.`;
    this.openAdminCommentId = null;
  }

  banirUsuario(comment: PostComment) {
    this.saveAdminModerationAction('hipatec_admin_user_bans', {
      usuario: comment.autora,
      criadoEm: new Date().toISOString(),
    });
    this.feedback = `${comment.autora} banida no mock administrativo.`;
    this.openAdminCommentId = null;
  }

  authorRoute(name: string): string {
    return `/perfil/${this.normalizeUserKey(name)}`;
  }

  categoryLabel(category: string): string {
    const labels: Record<string, string> = {
      conquista: 'Conquista',
      mentoria: 'Mentoria',
      apoio: 'Apoio',
      comunidade: 'Comunidade',
    };
    return labels[category] || category;
  }

  private loadPosts(): FeedPost[] {
    try {
      const raw = localStorage.getItem('hipatec_posts');
      return raw ? JSON.parse(raw) : feedPosts.map(post => ({ ...post }));
    } catch {
      return feedPosts.map(post => ({ ...post }));
    }
  }

  private normalizeUserKey(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }


  private saveAdminModerationAction(key: string, payload: Record<string, string>) {
    try {
      const raw = localStorage.getItem(key);
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem(key, JSON.stringify([payload, ...current]));
    } catch {
      // Mantem a acao visual mesmo se o navegador bloquear o localStorage.
    }
  }

  private savePost(post: FeedPost) {
    const posts = this.loadPosts();
    const next = posts.some(item => item.id === post.id)
      ? posts.map(item => item.id === post.id ? post : item)
      : [post, ...posts];
    try { localStorage.setItem('hipatec_posts', JSON.stringify(next)); } catch { /* ignore */ }
  }

}
