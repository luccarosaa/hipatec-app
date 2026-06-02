import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Mentoria } from '../../data/mvp-data';
import { findMentoria, loadInscritas, saveInscritas } from '../../data/mentorias-store';

@Component({
  selector: 'app-mentoria-detail',
  templateUrl: './mentoria-detail.page.html',
  styleUrls: ['./mentoria-detail.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, RouterLink, NavbarComponent],
})
export class MentoriaDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  mentoria?: Mentoria;
  inscrita = false;
  feedback = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.mentoria = findMentoria(id);
    this.inscrita = loadInscritas().includes(id);
  }

  inscrever() {
    if (!this.mentoria) {
      return;
    }

    const inscritas = loadInscritas();
    if (!inscritas.includes(this.mentoria.id)) {
      inscritas.push(this.mentoria.id);
      saveInscritas(inscritas);
    }

    this.inscrita = true;
    this.feedback = 'Inscrição confirmada. Você receberá os próximos passos por email.';
  }

  cancelarInscricao() {
    if (!this.mentoria || !window.confirm(`Cancelar inscrição em ${this.mentoria.titulo}?`)) {
      return;
    }

    saveInscritas(loadInscritas().filter(id => id !== this.mentoria?.id));
    this.inscrita = false;
    this.feedback = 'Inscrição cancelada com sucesso.';
  }

}
