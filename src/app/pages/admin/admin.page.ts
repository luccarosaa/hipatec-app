import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { deletePostComment, loadPostComments, PostComment, savePostComments } from '../../data/comments-store';
import { FeedPost, feedPosts, Oportunidade, oportunidades, UserRole } from '../../data/mvp-data';
import { AuthService, LocalUser } from '../../services/auth.service';

interface ModerationContent {
  id: string;
  kind: 'post' | 'comment';
  postId: number;
  commentId?: number;
  author: string;
  text: string;
  context: string;
}

interface UserAdminForm {
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  curso: string;
  campus: string;
  username: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, NavbarComponent, FooterComponent],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  feedback = '';
  users: LocalUser[] = [];
  moderation: ModerationContent[] = [];
  adminVagas: Oportunidade[] = [];
  settings = this.loadSettings();
  vagaForm = this.emptyVagaForm();
  editingVagaId: number | null = null;
  adminForm = this.emptyUserForm('administradoras');
  mentoraForm = this.emptyUserForm('mentoras');
  editingAdminId: number | null = null;
  editingMentoraId: number | null = null;

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/painel']);
      return;
    }

    this.reload();
    const vagaId = Number(this.route.snapshot.queryParamMap.get('vaga'));
    if (vagaId) {
      this.editarVagaPorId(vagaId);
    }
  }

  get admins(): LocalUser[] {
    return this.users.filter(user => user.isAdmin || user.email.toLowerCase() === 'admin@local.com');
  }

  get mentoras(): LocalUser[] {
    return this.users.filter(user => user.role === 'mentoras');
  }

  salvarVaga() {
    if (!this.vagaForm.titulo || !this.vagaForm.organizacao || !this.vagaForm.tipoVaga || !this.vagaForm.area) {
      this.feedback = 'Preencha título, organização, tipo e área da vaga.';
      return;
    }

    const vaga: Oportunidade = {
      id: this.editingVagaId || Date.now(),
      titulo: this.vagaForm.titulo,
      organizacao: this.vagaForm.organizacao,
      tipo: 'vaga',
      tipoVaga: this.vagaForm.tipoVaga,
      formato: this.vagaForm.formato,
      local: this.vagaForm.local || 'Brasil',
      estado: this.vagaForm.estado,
      cidade: this.vagaForm.cidade,
      area: this.vagaForm.area,
      publicadaHa: 'agora',
      prazo: this.vagaForm.prazo || 'Prazo a confirmar',
      descricao: this.vagaForm.descricao || 'Vaga cadastrada pela administração Hipatec.',
      tags: this.vagaForm.tags.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 4),
      linkExterno: this.vagaForm.linkExterno,
    };

    this.adminVagas = this.adminVagas.some(item => item.id === vaga.id)
      ? this.adminVagas.map(item => item.id === vaga.id ? vaga : item)
      : [vaga, ...this.adminVagas];
    this.saveAdminVagas();
    this.vagaForm = this.emptyVagaForm();
    this.feedback = this.editingVagaId ? 'Vaga atualizada com sucesso.' : 'Vaga cadastrada com sucesso.';
    this.editingVagaId = null;
  }

  editarVagaPorId(id: number) {
    const vaga = this.adminVagas.find(item => item.id === id) || oportunidades.find(item => item.id === id);
    if (!vaga) {
      this.feedback = 'Vaga não encontrada para edição.';
      return;
    }

    this.editingVagaId = vaga.id;
    this.vagaForm = {
      titulo: vaga.titulo,
      organizacao: vaga.organizacao,
      tipoVaga: vaga.tipoVaga || 'Estágio',
      formato: vaga.formato || 'Remoto',
      local: vaga.local || 'Brasil',
      estado: vaga.estado || 'SP',
      cidade: vaga.cidade || 'São Paulo',
      area: vaga.area || '',
      prazo: vaga.prazo || '',
      descricao: vaga.descricao || '',
      tags: vaga.tags.join(', '),
      linkExterno: vaga.linkExterno || '',
    };
    this.feedback = `Editando vaga: ${vaga.titulo}`;
  }

  cancelarEdicaoVaga() {
    this.editingVagaId = null;
    this.vagaForm = this.emptyVagaForm();
  }

  removerVaga(id: number) {
    this.adminVagas = this.adminVagas.filter(vaga => vaga.id !== id);
    this.saveAdminVagas();
    this.feedback = 'Vaga removida.';
  }

  salvarAdmin() {
    if (!this.adminForm.nome || !this.adminForm.email) {
      this.feedback = 'Informe nome e e-mail da administradora.';
      return;
    }

    const updates: Partial<LocalUser> = {
      nome: this.adminForm.nome,
      email: this.adminForm.email,
      username: this.adminForm.username || this.auth.normalizeUsername(this.adminForm.email.split('@')[0]),
      role: 'administradoras',
      curso: this.adminForm.curso || 'Administração Hipatec',
      campus: this.adminForm.campus || 'IFSP',
      isAdmin: true,
    };

    if (this.adminForm.senha) {
      updates.senha = this.adminForm.senha;
    }

    if (this.editingAdminId) {
      this.auth.updateUserById(this.editingAdminId, updates);
      this.feedback = 'Administradora atualizada.';
    } else {
      this.auth.registerLocal({
        nome: this.adminForm.nome,
        email: this.adminForm.email,
        senha: this.adminForm.senha || 'Admin@123',
        username: updates.username,
        role: 'administradoras',
        curso: updates.curso,
        campus: updates.campus,
        isAdmin: true,
      });
      this.feedback = 'Administradora adicionada.';
    }

    this.adminForm = this.emptyUserForm('administradoras');
    this.editingAdminId = null;
    this.reload();
  }

  editarAdmin(user: LocalUser) {
    this.editingAdminId = user.id;
    this.adminForm = this.userToForm(user);
  }

  salvarMentora() {
    if (!this.mentoraForm.nome || !this.mentoraForm.email) {
      this.feedback = 'Informe nome e e-mail da mentora.';
      return;
    }

    const updates: Partial<LocalUser> = {
      nome: this.mentoraForm.nome,
      email: this.mentoraForm.email,
      username: this.mentoraForm.username || this.auth.normalizeUsername(this.mentoraForm.email.split('@')[0]),
      role: 'mentoras',
      curso: this.mentoraForm.curso || 'Tecnologia e carreira',
      campus: this.mentoraForm.campus || 'IFSP',
      mentorStatus: 'validada',
      isAdmin: false,
    };

    if (this.mentoraForm.senha) {
      updates.senha = this.mentoraForm.senha;
    }

    if (this.editingMentoraId) {
      this.auth.updateUserById(this.editingMentoraId, updates);
      this.feedback = 'Mentora atualizada.';
    } else {
      this.auth.registerLocal({
        nome: this.mentoraForm.nome,
        email: this.mentoraForm.email,
        senha: this.mentoraForm.senha || 'Mentora@123',
        username: updates.username,
        role: 'mentoras',
        curso: updates.curso,
        campus: updates.campus,
        mentorStatus: 'validada',
      });
      this.feedback = 'Mentora adicionada.';
    }

    this.mentoraForm = this.emptyUserForm('mentoras');
    this.editingMentoraId = null;
    this.reload();
  }

  editarMentora(user: LocalUser) {
    this.editingMentoraId = user.id;
    this.mentoraForm = this.userToForm(user);
  }

  cancelarEdicao(tipo: 'admin' | 'mentora') {
    if (tipo === 'admin') {
      this.editingAdminId = null;
      this.adminForm = this.emptyUserForm('administradoras');
    } else {
      this.editingMentoraId = null;
      this.mentoraForm = this.emptyUserForm('mentoras');
    }
  }

  validarMentora(user: LocalUser, status: 'validada' | 'recusada') {
    this.auth.updateUserById(user.id, { mentorStatus: status });
    this.reload();
    this.feedback = status === 'validada' ? 'Mentora validada.' : 'Mentora recusada.';
  }

  excluirUsuario(user: LocalUser) {
    if (user.email.toLowerCase() === 'admin@local.com') {
      this.feedback = 'A conta administradora principal não pode ser excluída.';
      return;
    }

    this.auth.deleteUserById(user.id);
    this.reload();
    this.feedback = 'Usuária removida do mock local.';
  }

  removerConteudo(item: ModerationContent) {
    if (item.kind === 'comment' && item.commentId) {
      deletePostComment(item.postId, item.commentId);
      this.feedback = 'Comentário excluído.';
    } else {
      this.deletePost(item.postId);
      this.feedback = 'Publicação excluída.';
    }

    this.loadModeration();
  }

  salvarConfiguracoes() {
    try {
      localStorage.setItem('hipatec_admin_settings', JSON.stringify(this.settings));
      this.feedback = 'Configurações específicas salvas.';
    } catch {
      this.feedback = 'Não foi possível salvar configurações no navegador.';
    }
  }

  private reload() {
    this.users = this.auth.listUsers();
    this.adminVagas = this.loadAdminVagas();
    this.loadModeration();
  }

  private loadModeration() {
    const posts = this.loadPosts();
    this.moderation = posts.reduce<ModerationContent[]>((items, post) => {
      items.push({
        id: `post-${post.id}`,
        kind: 'post',
        postId: post.id,
        author: post.autora,
        text: post.texto,
        context: 'Publicação no feed',
      });

      loadPostComments(post.id).forEach(comment => {
        items.push({
          id: `comment-${post.id}-${comment.id}`,
          kind: 'comment',
          postId: post.id,
          commentId: comment.id,
          author: comment.autora,
          text: comment.texto,
          context: `Comentário em publicação de ${post.autora}`,
        });
      });

      return items;
    }, []);
  }

  private deletePost(postId: number) {
    const next = this.loadPosts().filter(post => post.id !== postId);
    try { localStorage.setItem('hipatec_posts', JSON.stringify(next)); } catch { /* ignore */ }
    savePostComments(postId, []);
  }

  private loadPosts(): FeedPost[] {
    try {
      const raw = localStorage.getItem('hipatec_posts');
      return raw ? JSON.parse(raw) : feedPosts.map(post => ({ ...post }));
    } catch {
      return feedPosts.map(post => ({ ...post }));
    }
  }

  private loadAdminVagas(): Oportunidade[] {
    try {
      const raw = localStorage.getItem('hipatec_admin_vagas');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveAdminVagas() {
    try { localStorage.setItem('hipatec_admin_vagas', JSON.stringify(this.adminVagas)); } catch { /* ignore */ }
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem('hipatec_admin_settings');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch { /* ignore */ }

    return {
      contatoApoio: 'apoio@hipatec.local',
      termoUso: 'Política de uso em revisão acadêmica.',
      avisoComunidade: 'Mantenha comentários respeitosos, objetivos e acolhedores.',
    };
  }

  private emptyVagaForm() {
    return {
      titulo: '',
      organizacao: '',
      tipoVaga: 'Estágio',
      formato: 'Remoto',
      local: 'Brasil',
      estado: 'SP',
      cidade: 'São Paulo',
      area: '',
      prazo: '',
      descricao: '',
      tags: '',
      linkExterno: '',
    };
  }

  private emptyUserForm(role: UserRole): UserAdminForm {
    return {
      nome: '',
      email: '',
      senha: '',
      role,
      curso: role === 'mentoras' ? 'Tecnologia e carreira' : 'Administração Hipatec',
      campus: 'IFSP',
      username: '',
    };
  }

  private userToForm(user: LocalUser): UserAdminForm {
    return {
      nome: user.nome,
      email: user.email,
      senha: '',
      role: user.role,
      curso: user.curso || '',
      campus: user.campus || 'IFSP',
      username: user.username || '',
    };
  }
}
