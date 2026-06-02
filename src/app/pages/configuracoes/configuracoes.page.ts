import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, NavbarComponent, FooterComponent],
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
})
export class ConfiguracoesPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  emailNotificacoes = true;
  oportunidades = true;
  perfilPublico = true;
  altoContraste = false;
  email = '';
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  emailFeedback = '';
  senhaFeedback = '';
  preferenciasFeedback = '';

  ngOnInit() {
    this.email = this.auth.getCurrentUser()?.email || '';
    this.carregarPreferencias();
  }

  salvarEmail() {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!emailValido) {
      this.emailFeedback = 'Informe um e-mail válido.';
      return;
    }

    const result = this.auth.updateEmail(this.email);
    this.emailFeedback = result.message;
  }

  alterarSenha() {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
      this.senhaFeedback = 'Preencha senha atual, nova senha e confirmação.';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.senhaFeedback = 'A confirmação não confere com a nova senha.';
      return;
    }

    const senhaSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,18}$/.test(this.novaSenha);
    if (!senhaSegura) {
      this.senhaFeedback = 'A senha deve ter 8 a 18 caracteres, com maiúscula, minúscula, número e caractere especial.';
      return;
    }

    const result = this.auth.updatePassword(this.senhaAtual, this.novaSenha);
    this.senhaFeedback = result.message;
    if (result.ok) {
      this.senhaAtual = '';
      this.novaSenha = '';
      this.confirmarSenha = '';
    }
  }

  salvarPreferencias() {
    const preferencias = {
      emailNotificacoes: this.emailNotificacoes,
      oportunidades: this.oportunidades,
      perfilPublico: this.perfilPublico,
      altoContraste: this.altoContraste,
    };

    try {
      localStorage.setItem('hipatec_preferencias', JSON.stringify(preferencias));
    } catch {
      // Mantem a pagina funcional mesmo sem acesso ao localStorage.
    }

    this.preferenciasFeedback = 'Preferências salvas com sucesso.';
  }

  sair() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }

  private carregarPreferencias() {
    try {
      const raw = localStorage.getItem('hipatec_preferencias');
      if (!raw) {
        return;
      }

      const preferencias = JSON.parse(raw);
      this.emailNotificacoes = preferencias.emailNotificacoes ?? this.emailNotificacoes;
      this.oportunidades = preferencias.oportunidades ?? this.oportunidades;
      this.perfilPublico = preferencias.perfilPublico ?? this.perfilPublico;
      this.altoContraste = preferencias.altoContraste ?? this.altoContraste;
    } catch {
      // Preferencias seguem com os valores padrao.
    }
  }
}

