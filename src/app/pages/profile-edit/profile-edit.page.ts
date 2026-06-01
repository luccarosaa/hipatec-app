import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService, LocalUser } from '../../services/auth.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonContent, NavbarComponent, FooterComponent],
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  user: Partial<LocalUser> = {};
  habilidades = '';
  interesses = '';
  feedback = '';

  ngOnInit() {
    this.user = {
      nome: 'Usuária Hipatec',
      username: 'hipatec',
      curso: 'Tecnologia',
      semestre: 'Em atualização',
      bio: 'Participante da comunidade Hipatec.',
      ...this.auth.getCurrentUser(),
    };
    this.habilidades = localStorage.getItem('hipatec_profile_skills') || 'HTML, CSS, Git';
    this.interesses = localStorage.getItem('hipatec_profile_interests') || 'Frontend, Dados, Mentoria';
  }

  salvar() {
    if (!this.user.nome || !this.user.username) {
      this.feedback = 'Nome e nome de usuário são obrigatórios.';
      return;
    }

    const username = this.user.username.replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase();
    this.user.username = username;
    this.auth.updateCurrentUser(this.user);
    localStorage.setItem('hipatec_profile_skills', this.habilidades);
    localStorage.setItem('hipatec_profile_interests', this.interesses);
    this.feedback = 'Perfil atualizado com sucesso.';
    setTimeout(() => this.router.navigate(['/perfil']), 500);
  }
}
