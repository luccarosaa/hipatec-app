import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FeedPost, feedPosts } from '../../data/mvp-data';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, NavbarComponent],
})
export class FeedPage {
  private router = inject(Router);
  posts: FeedPost[] = this.loadPosts();
  novoPost = '';
  feedback = '';

  abrirPost(post: FeedPost) {
    this.router.navigate(['/posts', post.id]);
  }

  criarPost() {
    const texto = this.novoPost.trim();
    if (!texto) {
      this.feedback = 'Escreva uma dúvida, conquista ou pedido de apoio para publicar.';
      return;
    }

    const post: FeedPost = {
      id: Date.now(),
      autora: 'Você',
      papel: 'Comunidade Hipatec',
      tempo: 'agora',
      texto,
      curtidas: 0,
      comentarios: 0,
      categoria: 'comunidade',
    };

    this.posts = [post, ...this.posts];
    this.novoPost = '';
    this.feedback = 'Publicação adicionada ao feed.';
    this.savePosts();
  }

  curtir(post: FeedPost, event?: Event) {
    event?.stopPropagation();
    post.liked = !post.liked;
    post.curtidas += post.liked ? 1 : -1;
    this.savePosts();
  }

  comentar(post: FeedPost, event?: Event) {
    event?.stopPropagation();
    this.router.navigate(['/posts', post.id]);
  }

  compartilhar(post: FeedPost, event?: Event) {
    event?.stopPropagation();
    this.feedback = `Link da publicação de ${post.autora} pronto para compartilhar no protótipo.`;
  }

  salvar(post: FeedPost, event?: Event) {
    event?.stopPropagation();
    post.saved = !post.saved;
    this.feedback = post.saved ? 'Publicação salva.' : 'Publicação removida dos salvos.';
    this.savePosts();
  }

  private loadPosts(): FeedPost[] {
    try {
      const raw = localStorage.getItem('hipatec_posts');
      return raw ? JSON.parse(raw) : feedPosts.map(post => ({ ...post }));
    } catch {
      return feedPosts.map(post => ({ ...post }));
    }
  }

  private savePosts() {
    try { localStorage.setItem('hipatec_posts', JSON.stringify(this.posts)); } catch { /* ignore */ }
  }
}
