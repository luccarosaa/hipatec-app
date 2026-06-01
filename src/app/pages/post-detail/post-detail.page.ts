import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FeedPost, feedPosts } from '../../data/mvp-data';

interface PostComment {
  id: number;
  autora: string;
  texto: string;
  data: string;
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
})
export class PostDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  post?: FeedPost;
  comments: PostComment[] = [];
  novoComentario = '';
  feedback = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.post = this.loadPosts().find(item => item.id === id);
    this.comments = this.loadComments(id);
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
    this.feedback = 'Link da publicação pronto para compartilhar no protótipo.';
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
      autora: 'Você',
      texto,
      data: 'agora',
    };

    this.comments = [comment, ...this.comments];
    this.novoComentario = '';
    this.post.comentarios += 1;
    this.savePost(this.post);
    this.saveComments(this.post.id);
    this.feedback = 'Comentário publicado.';
  }

  private loadPosts(): FeedPost[] {
    try {
      const raw = localStorage.getItem('hipatec_posts');
      return raw ? JSON.parse(raw) : feedPosts.map(post => ({ ...post }));
    } catch {
      return feedPosts.map(post => ({ ...post }));
    }
  }

  private savePost(post: FeedPost) {
    const posts = this.loadPosts();
    const next = posts.some(item => item.id === post.id)
      ? posts.map(item => item.id === post.id ? post : item)
      : [post, ...posts];
    try { localStorage.setItem('hipatec_posts', JSON.stringify(next)); } catch { /* ignore */ }
  }

  private loadComments(postId: number): PostComment[] {
    try {
      const raw = localStorage.getItem(`hipatec_comments_${postId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch { /* ignore */ }

    if (postId === 1) {
      return [
        { id: 1, autora: 'Marina Lopes', texto: 'Parabéns! Seu próximo passo pode ser publicar esse CRUD no GitHub com README.', data: '1h' },
        { id: 2, autora: 'Júlia Mendes', texto: 'Também estou estudando Angular. Podemos trocar referências.', data: '35min' },
      ];
    }

    return [];
  }

  private saveComments(postId: number) {
    try { localStorage.setItem(`hipatec_comments_${postId}`, JSON.stringify(this.comments)); } catch { /* ignore */ }
  }
}
