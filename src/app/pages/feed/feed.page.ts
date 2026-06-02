import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FeedPost, feedPosts } from '../../data/mvp-data';
import { AuthService } from '../../services/auth.service';
import { getPostCommentCount } from '../../data/comments-store';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, NavbarComponent, RouterLink],
})
export class FeedPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  allPosts: FeedPost[] = this.loadPosts();
  posts: FeedPost[] = [...this.allPosts];
  novoPost = '';
  imagemPost = '';
  imagemFileName = '';
  feedback = '';

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => this.applySearch(params.get('q') || ''));
  }

  abrirPost(post: FeedPost) {
    this.router.navigate(['/posts', post.id]);
  }

  criarPost() {
    const texto = this.novoPost.trim();
    if (!texto && !this.imagemPost) {
      this.feedback = 'Escreva uma dúvida, conquista ou adicione uma imagem para publicar.';
      return;
    }

    const post: FeedPost = {
      id: Date.now(),
      autora: this.auth.getCurrentUser()?.nome || 'Você',
      papel: this.auth.getCurrentUser()?.role === 'administradoras' ? 'Administrador' : this.auth.getCurrentUser()?.role === 'mentoras' ? 'Mentora' : 'Estudante',
      tempo: 'agora',
      texto,
      curtidas: 0,
      comentarios: 0,
      categoria: 'comunidade',
      imagem: this.imagemPost || undefined,
    };

    this.allPosts = [post, ...this.allPosts];
    this.posts = [...this.allPosts];
    this.novoPost = '';
    this.removerImagem();
    this.feedback = 'Publicação adicionada ao feed.';
    this.savePosts();
  }


  selecionarImagem(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.feedback = 'Selecione um arquivo de imagem.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagemPost = String(reader.result || '');
      this.imagemFileName = file.name;
      this.feedback = 'Imagem adicionada à publicação.';
    };
    reader.readAsDataURL(file);
  }

  removerImagem() {
    this.imagemPost = '';
    this.imagemFileName = '';
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
    this.feedback = `Link da publicação de ${post.autora} pronto para compartilhar.`;
  }

  salvar(post: FeedPost, event?: Event) {
    event?.stopPropagation();
    post.saved = !post.saved;
    this.feedback = post.saved ? 'Publicação salva.' : 'Publicação removida dos salvos.';
    this.savePosts();
  }

  authorRoute(name: string): string {
    return `/perfil/${this.normalizeUserKey(name)}`;
  }

  categoryLabel(category: string): string {
    const labels: Record<string, string> = { conquista: 'Conquista', mentoria: 'Mentoria', apoio: 'Apoio', comunidade: 'Comunidade' };
    return labels[category] || category;
  }

  private applySearch(term: string) {
    const q = this.normalize(term);
    this.posts = q
      ? this.allPosts.filter(post => this.normalize(`${post.autora} ${post.papel} ${post.texto} ${post.categoria}`).includes(q))
      : [...this.allPosts];
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private normalizeUserKey(value: string): string {
    return this.normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private loadPosts(): FeedPost[] {
    try {
      const raw = localStorage.getItem('hipatec_posts');
      const posts: FeedPost[] = raw ? JSON.parse(raw) : feedPosts.map(post => ({ ...post }));
      return posts.map(post => ({ ...post, comentarios: getPostCommentCount(post.id) }));
    } catch {
      return feedPosts.map(post => ({ ...post, comentarios: getPostCommentCount(post.id) }));
    }
  }

  private savePosts() {
    try { localStorage.setItem('hipatec_posts', JSON.stringify(this.allPosts)); } catch { /* ignore */ }
  }
}
