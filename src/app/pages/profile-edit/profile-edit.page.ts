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
  interessesSelecionados: string[] = [];
  feedback = '';
  semestres = Array.from({ length: 10 }, (_, index) => `${index + 1}° semestre`);
  areasInteresse = [
    'Frontend',
    'Backend',
    'Dados',
    'UX/UI',
    'Inteligência artificial',
    'Segurança da informação',
    'Primeira vaga',
    'Mentoria',
    'Pesquisa',
    'Empreendedorismo',
  ];

  ngOnInit() {
    this.user = {
      nome: 'Usuária Hipatec',
      username: 'hipatec',
      curso: 'Tecnologia',
      semestre: '1° semestre',
      bio: 'Participante da comunidade Hipatec.',
      ...this.auth.getCurrentUser(),
    };
    this.habilidades = localStorage.getItem('hipatec_profile_skills') || 'HTML, CSS, Git';
    this.interessesSelecionados = this.parseList(localStorage.getItem('hipatec_profile_interests')) || ['Frontend', 'Dados', 'Mentoria'];
  }

  onFotoSelecionada(event: Event) {
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
      this.user.foto = String(reader.result);
      this.feedback = '';
    };
    reader.readAsDataURL(file);
  }

  toggleInteresse(area: string) {
    this.interessesSelecionados = this.interessesSelecionados.includes(area)
      ? this.interessesSelecionados.filter(item => item !== area)
      : [...this.interessesSelecionados, area];
  }

  salvar() {
    if (!this.user.nome || !this.user.username) {
      this.feedback = 'Nome e nome de usuário são obrigatórios.';
      return;
    }

    const username = this.auth.normalizeUsername(this.user.username);
    const currentId = Number(this.user.id || this.auth.getToken() || 0);

    if (username.length < 3) {
      this.feedback = 'O nome de usuário deve ter pelo menos 3 caracteres válidos.';
      return;
    }

    if (!this.auth.isUsernameAvailable(username, currentId)) {
      this.feedback = 'Este nome de usuário já está em uso. Escolha outro.';
      return;
    }

    if (!this.interessesSelecionados.length) {
      this.feedback = 'Selecione pelo menos uma área de interesse.';
      return;
    }

    this.user.username = username;
    this.auth.updateCurrentUser(this.user);
    localStorage.setItem('hipatec_profile_skills', this.habilidades);
    localStorage.setItem('hipatec_profile_interests', this.interessesSelecionados.join(', '));
    this.feedback = 'Perfil atualizado com sucesso.';
    setTimeout(() => this.router.navigate(['/perfil']), 500);
  }

  private parseList(value: string | null): string[] | null {
    if (!value) {
      return null;
    }

    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    return items.length ? items : null;
  }
}
