import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Mentoria } from '../../data/mvp-data';
import { loadAllMentorias, loadInscritas, saveInscritas } from '../../data/mentorias-store';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mentorias',
  templateUrl: './mentorias.page.html',
  styleUrls: ['./mentorias.page.scss'],
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, RouterLink, NavbarComponent],
  standalone: true
})
export class MentoriasPage implements OnInit {
  private auth = inject(AuthService);
  userRole = 'estudantes';
  mentorias: Mentoria[] = [];
  inscritas: number[] = [];
  feedback = '';

  ngOnInit() {
    this.userRole = this.auth.getCurrentUser()?.role || 'estudantes';
    this.mentorias = loadAllMentorias().filter(item => item.status !== 'cancelada');
    this.inscritas = loadInscritas();
  }

  isInscrita(id: number): boolean {
    return this.inscritas.includes(id);
  }

  inscrever(mentoria: Mentoria) {
    if (!this.isInscrita(mentoria.id)) {
      this.inscritas = [...this.inscritas, mentoria.id];
      saveInscritas(this.inscritas);
    }

    this.feedback = `Inscrição confirmada em ${mentoria.titulo}.`;
  }

}
