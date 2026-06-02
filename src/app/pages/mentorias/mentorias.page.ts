import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  userRole = 'estudantes';
  allMentorias: Mentoria[] = [];
  mentorias: Mentoria[] = [];
  inscritas: number[] = [];
  feedback = '';
  view: 'aprendizado' | 'todas' = 'aprendizado';

  ngOnInit() {
    this.userRole = this.auth.getCurrentUser()?.role || 'estudantes';
    this.allMentorias = loadAllMentorias().filter(item => item.status !== 'cancelada');
    this.inscritas = loadInscritas();
    this.route.queryParamMap.subscribe(params => {
      this.view = params.get('view') === 'todas' ? 'todas' : 'aprendizado';
      this.applySearch(params.get('q') || '');
    });
  }

  get mentoriasInscritas(): Mentoria[] {
    return this.mentorias.filter(item => this.isInscrita(item.id)).slice(0, 6);
  }

  get continuarAprendendo(): Mentoria[] {
    return this.mentorias.filter(item => !this.isInscrita(item.id)).slice(0, 3);
  }

  get catalogoMentorias(): Mentoria[] {
    return this.mentorias.slice(0, 6);
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

  private applySearch(term: string) {
    const q = this.normalize(term);
    this.mentorias = q
      ? this.allMentorias.filter(item => this.normalize(`${item.titulo} ${item.tema} ${item.mentora} ${item.descricao} ${item.tags.join(' ')}`).includes(q))
      : [...this.allMentorias];
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
