import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService, LocalUser } from '../../services/auth.service';
import { FeedPost, feedPosts, oportunidades } from '../../data/mvp-data';
import { loadAllMentorias, loadCreatedMentorias, loadInscritas, saveInscritas } from '../../data/mentorias-store';
import { getPostCommentCount, loadPostComments } from '../../data/comments-store';

interface ProfileActivity {
  kind: 'post' | 'comment';
  id: number;
  postId: number;
  autora: string;
  papel: string;
  tempo: string;
  texto: string;
  categoria: string;
  curtidas?: number;
  comentarios?: number;
  postAutora?: string;
}

interface AgendaItem {
  id?: number;
  titulo: string;
  data: string;
  horario: string;
  tipo: string;
  status: 'Confirmado' | 'Pendente' | 'Encerrado' | 'Cancelada';
  isMentoria?: boolean;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, RouterLink, NavbarComponent]
})
export class ProfilePage implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  user: Partial<LocalUser> = {};
  habilidades = ['HTML', 'CSS', 'Lógica', 'Comunicação', 'Git'];
  interesses = ['Frontend', 'Dados', 'Primeira vaga', 'Mentoria'];
  allPosts: FeedPost[] = this.loadPosts();
  postsPage = 1;
  postsPerPage = 25;
  agenda: AgendaItem[] = [];
  agendaPage = 1;
  agendaPerPage = 3;
  feedback = '';
  mentoriasCriadas = 0;
  isOwnProfile = true;

  ngOnInit() {
    const current = this.auth.getCurrentUser() || {
      nome: 'Ana Clara',
      username: 'anaclara',
      email: 'ana.clara@ifsp.edu.br',
      role: 'estudantes',
      curso: 'Análise e Desenvolvimento de Sistemas',
      campus: 'Câmpus São Paulo',
      semestre: '3° semestre',
      bio: 'Estudante do IFSP interessada em frontend, carreira e permanência feminina na tecnologia.',
    };
    const username = this.route.snapshot.paramMap.get('username');
    this.isOwnProfile = !username || this.normalizeUserKey(username) === this.normalizeUserKey(current.username || current.nome || '');
    this.user = this.isOwnProfile ? current : this.buildAuthorProfile(username || '');
    this.habilidades = this.isOwnProfile ? this.parseList(localStorage.getItem('hipatec_profile_skills')) || this.habilidades : ['Comunicação', 'Git', 'Estudos'];
    this.interesses = this.isOwnProfile ? this.parseList(localStorage.getItem('hipatec_profile_interests')) || this.interesses : ['Comunidade', 'Carreira', 'Tecnologia'];
    this.agenda = this.isOwnProfile ? this.buildAgenda() : [];
    this.agendaPage = Math.min(this.totalAgendaPages, this.agendaPage);
    this.mentoriasCriadas = this.isOwnProfile ? loadCreatedMentorias().filter(item => item.criadaPor === this.user.email && item.status !== 'cancelada').length : 0;
  }

  get initials(): string {
    return (this.user.nome || 'H').slice(0, 1).toUpperCase();
  }

  get roleLabel(): string {
    return this.user.role === 'administradoras' ? 'Administrador' : this.user.role === 'mentoras' ? 'Mentora' : 'Estudante';
  }

  get agendaPaginada(): AgendaItem[] {
    const inicio = (this.agendaPage - 1) * this.agendaPerPage;
    return this.agenda.slice(inicio, inicio + this.agendaPerPage);
  }

  get totalAgendaPages(): number {
    return Math.max(1, Math.ceil(this.agenda.length / this.agendaPerPage));
  }

  mudarPaginaAgenda(delta: number) {
    this.agendaPage = Math.min(this.totalAgendaPages, Math.max(1, this.agendaPage + delta));
  }

  get profilePosts(): FeedPost[] {
    const key = this.normalizeUserKey(this.user.nome || this.user.username || '');
    return this.allPosts.filter(post => {
      const authorKey = this.normalizeUserKey(post.autora);
      return authorKey === key || (this.isOwnProfile && post.autora === 'Você');
    });
  }

  get profileActivities(): ProfileActivity[] {
    return [
      ...this.profilePosts.map(post => ({
        kind: 'post' as const,
        id: post.id,
        postId: post.id,
        autora: post.autora,
        papel: post.papel,
        tempo: post.tempo,
        texto: post.texto,
        categoria: post.categoria,
        curtidas: post.curtidas,
        comentarios: post.comentarios,
      })),
      ...this.profileComments,
    ];
  }

  get postsPaginados(): ProfileActivity[] {
    const inicio = (this.postsPage - 1) * this.postsPerPage;
    return this.profileActivities.slice(inicio, inicio + this.postsPerPage);
  }

  get totalPostPages(): number {
    return Math.max(1, Math.ceil(this.profileActivities.length / this.postsPerPage));
  }

  mudarPaginaPosts(delta: number) {
    this.postsPage = Math.min(this.totalPostPages, Math.max(1, this.postsPage + delta));
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

  cancelarInscricao(item: AgendaItem) {
    if (!item.id || !window.confirm(`Cancelar inscrição em ${item.titulo}?`)) {
      return;
    }

    const next = loadInscritas().filter(id => id !== item.id);
    saveInscritas(next);
    this.agenda = this.buildAgenda();
    this.agendaPage = Math.min(this.totalAgendaPages, this.agendaPage);
    this.mentoriasCriadas = loadCreatedMentorias().filter(item => item.criadaPor === this.user.email && item.status !== 'cancelada').length;
    this.feedback = 'Inscrição cancelada com sucesso.';
  }


  private get profileComments(): ProfileActivity[] {
    const userKey = this.normalizeUserKey(this.user.nome || this.user.username || '');

    return this.allPosts.reduce<ProfileActivity[]>((items, post) => {
      loadPostComments(post.id)
        .filter(comment => this.normalizeUserKey(comment.autora) === userKey || (this.isOwnProfile && comment.autora === 'Você'))
        .forEach(comment => {
          items.push({
            kind: 'comment',
            id: comment.id,
            postId: post.id,
            autora: comment.autora === 'Você' ? (this.user.nome || 'Participante Hipatec') : comment.autora,
            papel: 'Comentário',
            tempo: comment.data,
            texto: comment.texto,
            categoria: post.categoria,
            postAutora: post.autora,
          });
        });

      return items;
    }, []);
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

  private buildAuthorProfile(username: string): Partial<LocalUser> {
    const post = this.allPosts.find(item => this.normalizeUserKey(item.autora) === this.normalizeUserKey(username));
    const nome = post?.autora || username.replace(/-/g, ' ') || 'Usuária Hipatec';
    return {
      nome,
      username: this.normalizeUserKey(nome),
      email: '',
      role: post?.papel?.toLowerCase().includes('admin') ? 'administradoras' : post?.papel?.toLowerCase().includes('mentora') ? 'mentoras' : 'estudantes',
      curso: post?.papel || 'Comunidade Hipatec',
      campus: 'IFSP',
      semestre: 'Em atualização',
      bio: `${nome} participa da comunidade Hipatec compartilhando experiências e aprendizados.`,
    };
  }

  private normalizeUserKey(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private buildAgenda(): AgendaItem[] {
    const allMentorias = loadAllMentorias();
    const agendaMentorias = this.user.role === 'mentoras'
      ? loadCreatedMentorias()
          .filter(item => item.criadaPor === this.user.email && item.status !== 'cancelada')
          .map(item => ({
            id: item.id,
            titulo: item.titulo,
            data: item.data,
            horario: item.horario,
            tipo: 'Mentoria criada',
            status: this.mapStatus(item.status),
            isMentoria: true,
          }))
      : allMentorias
          .filter(item => loadInscritas().includes(item.id) && item.status !== 'cancelada')
          .map(item => ({
            id: item.id,
            titulo: item.titulo,
            data: item.data,
            horario: item.horario,
            tipo: 'Mentoria inscrita',
            status: this.mapStatus(item.status),
            isMentoria: true,
          }));

    return [
      ...agendaMentorias,
      {
        titulo: oportunidades[1].titulo,
        data: '14/06/2026',
        horario: '10h',
        tipo: 'Evento salvo',
        status: 'Confirmado',
      },
    ];
  }

  private mapStatus(status?: string): AgendaItem['status'] {
    if (status === 'encerrada') {
      return 'Encerrado';
    }

    if (status === 'cancelada') {
      return 'Cancelada';
    }

    if (status === 'agendada') {
      return 'Pendente';
    }

    return 'Confirmado';
  }

  private parseList(value: string | null): string[] | null {
    if (!value) {
      return null;
    }

    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    return items.length ? items : null;
  }
}
