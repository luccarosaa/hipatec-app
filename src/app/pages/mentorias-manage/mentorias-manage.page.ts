import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Mentoria } from '../../data/mvp-data';
import { loadCreatedMentorias, saveCreatedMentorias, upsertMentoria } from '../../data/mentorias-store';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mentorias-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, NavbarComponent, FooterComponent],
  templateUrl: './mentorias-manage.page.html',
  styleUrls: ['./mentorias-manage.page.scss'],
})
export class MentoriasManagePage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  user = this.auth.getCurrentUser();
  mentorias: Mentoria[] = [];
  feedback = '';
  editingId: number | null = null;
  participantesVisiveis: number | null = null;
  form = this.emptyForm();

  ngOnInit() {
    if (this.user?.role !== 'mentoras') {
      this.router.navigate(['/mentorias']);
      return;
    }

    this.loadMentorias();
  }

  salvar() {
    if (!this.form.titulo || !this.form.descricao || !this.form.tema || !this.form.data || !this.form.horario || !this.form.vagas) {
      this.feedback = 'Preencha título, descrição, tema, data, horário e vagas.';
      return;
    }

    const mentoria: Mentoria = {
      id: this.editingId || Date.now(),
      titulo: this.form.titulo,
      descricao: this.form.descricao,
      tema: this.form.tema,
      mentora: this.user?.nome || 'Mentora Hipatec',
      cargo: 'Mentora da comunidade Hipatec',
      data: this.formatDate(this.form.data),
      horario: this.form.horario,
      duracao: this.form.duracao || '1h',
      vagas: Number(this.form.vagas),
      formato: this.form.formato,
      local: this.form.local,
      preRequisitos: this.form.preRequisitos,
      materiais: this.form.materiais,
      tags: this.form.tema.split(',').map(item => item.trim()).filter(Boolean).slice(0, 4),
      status: this.form.status,
      inscritas: this.form.inscritas,
      participantes: this.form.participantes,
      criadaPor: this.user?.email || 'mentora',
    };

    upsertMentoria(mentoria);
    this.feedback = this.editingId ? 'Mentoria atualizada com sucesso.' : 'Mentoria criada e agendada com sucesso.';
    this.cancelarEdicao();
    this.loadMentorias();
  }

  editar(mentoria: Mentoria) {
    this.editingId = mentoria.id;
    this.form = {
      titulo: mentoria.titulo,
      descricao: mentoria.descricao,
      tema: mentoria.tema,
      data: this.toInputDate(mentoria.data),
      horario: mentoria.horario,
      duracao: mentoria.duracao || '1h',
      vagas: mentoria.vagas,
      formato: mentoria.formato || 'Online',
      local: mentoria.local || '',
      preRequisitos: mentoria.preRequisitos || '',
      materiais: mentoria.materiais || '',
      status: mentoria.status || 'agendada',
      inscritas: mentoria.inscritas || 0,
      participantes: mentoria.participantes || [],
    };
    this.feedback = 'Editando mentoria selecionada.';
  }

  atualizarStatus(mentoria: Mentoria, status: Mentoria['status']) {
    upsertMentoria({ ...mentoria, status });
    this.feedback = status === 'encerrada' ? 'Mentoria encerrada.' : 'Mentoria cancelada.';
    this.loadMentorias();
  }

  verParticipantes(id: number) {
    this.participantesVisiveis = this.participantesVisiveis === id ? null : id;
  }

  cancelarEdicao() {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  private loadMentorias() {
    const email = this.user?.email || 'mentora';
    this.mentorias = loadCreatedMentorias().filter(item => item.criadaPor === email);
  }

  private emptyForm() {
    return {
      titulo: '',
      descricao: '',
      tema: '',
      data: '',
      horario: '',
      duracao: '1h',
      vagas: 6,
      formato: 'Online',
      local: '',
      preRequisitos: '',
      materiais: '',
      status: 'agendada' as Mentoria['status'],
      inscritas: 0,
      participantes: [] as string[],
    };
  }

  private formatDate(value: string): string {
    if (!value || !value.includes('-')) {
      return value;
    }

    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  private toInputDate(value: string): string {
    if (!value || !value.includes('/')) {
      return value;
    }

    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }
}
