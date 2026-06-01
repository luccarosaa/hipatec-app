import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService, LocalUser } from '../../services/auth.service';
import { feedPosts, oportunidades } from '../../data/mvp-data';
import { loadAllMentorias, loadCreatedMentorias, loadInscritas, saveInscritas } from '../../data/mentorias-store';

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
  user: Partial<LocalUser> = {};
  habilidades = ['HTML', 'CSS', 'Lógica', 'Comunicação', 'Git'];
  interesses = ['Frontend', 'Dados', 'Primeira vaga', 'Mentoria'];
  posts = feedPosts.slice(0, 2);
  mentorias = loadAllMentorias().slice(0, 2);
  agenda: AgendaItem[] = [];
  feedback = '';

  ngOnInit() {
    this.user = this.auth.getCurrentUser() || {
      nome: 'Ana Clara',
      username: 'anaclara',
      email: 'ana.clara@ifsp.edu.br',
      role: 'estudantes',
      curso: 'Análise e Desenvolvimento de Sistemas',
      semestre: '3o semestre',
      bio: 'Estudante do IFSP interessada em frontend, carreira e permanência feminina na tecnologia.',
    };
    this.habilidades = this.parseList(localStorage.getItem('hipatec_profile_skills')) || this.habilidades;
    this.interesses = this.parseList(localStorage.getItem('hipatec_profile_interests')) || this.interesses;
    this.agenda = this.buildAgenda();
  }

  get initials(): string {
    return (this.user.nome || 'H').slice(0, 1).toUpperCase();
  }

  get roleLabel(): string {
    return this.user.role === 'mentoras' ? 'Mentora' : 'Estudante';
  }

  cancelarInscricao(item: AgendaItem) {
    if (!item.id || !window.confirm(`Cancelar inscrição em ${item.titulo}?`)) {
      return;
    }

    const next = loadInscritas().filter(id => id !== item.id);
    saveInscritas(next);
    this.agenda = this.buildAgenda();
    this.feedback = 'Inscrição cancelada com sucesso.';
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
