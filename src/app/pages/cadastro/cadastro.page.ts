import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { EstudanteService } from '../../services/estudante.service';
import { MentoraService } from '../../services/mentora.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../data/mvp-data';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonLabel, IonSegment, IonSegmentButton, CommonModule, FormsModule, RouterLink]
})
export class CadastroPage {
  private estudanteService = inject(EstudanteService);
  private mentoraService = inject(MentoraService);
  private auth = inject(AuthService);
  private router = inject(Router);
  role: UserRole = 'estudantes';
  nome = '';
  username = '';
  email = '';
  senha = '';
  dataNascimento = '';
  feedback = '';

  switchRole(ev: any) {
    this.role = ev.detail?.value || 'estudantes';
    this.feedback = '';
  }

  cadastrar() {
    if (!this.nome || !this.username || !this.email || !this.senha || !this.dataNascimento) {
      this.feedback = 'Preencha todos os campos para continuar.';
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!emailValido) {
      this.feedback = 'Informe um email válido.';
      return;
    }

    const senhaSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,18}$/.test(this.senha);
    if (!senhaSegura) {
      this.feedback = 'A senha deve ter 8 a 18 caracteres, com maiúscula, minúscula, número e caractere especial.';
      return;
    }

    this.username = this.username.replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase();
    if (this.username.length < 3) {
      this.feedback = 'O nome de usuário deve ter pelo menos 3 caracteres válidos.';
      return;
    }

    const payload = {
      nome: this.nome,
      username: this.username,
      email: this.email,
      senha: this.senha,
      dataNascimento: this.dataNascimento,
    };

    const request = this.role === 'estudantes'
      ? this.estudanteService.create(payload)
      : this.mentoraService.create(payload);

    request.subscribe({
      next: () => this.finalizarCadastro(),
      error: () => this.finalizarCadastro(),
    });
  }

  private finalizarCadastro() {
    const user = this.auth.registerLocal({
      nome: this.nome,
      username: this.username,
      email: this.email,
      senha: this.senha,
      dataNascimento: this.dataNascimento,
      role: this.role,
    });

    this.auth.saveToken(String(user.id));
    this.auth.saveCurrentUser(user);
    this.feedback = 'Cadastro realizado. Redirecionando para o feed...';
    setTimeout(() => this.router.navigate(['/feed']), 450);
  }
}
