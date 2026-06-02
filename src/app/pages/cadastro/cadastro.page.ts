import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { EstudanteService } from '../../services/estudante.service';
import { MentoraService } from '../../services/mentora.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../data/mvp-data';
import { ifspCampiSaoPaulo } from '../../data/ifsp-sao-paulo';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonLabel, IonSegment, IonSegmentButton, CommonModule, FormsModule, RouterLink]
})
export class CadastroPage implements OnInit {
  private estudanteService = inject(EstudanteService);
  private mentoraService = inject(MentoraService);
  private auth = inject(AuthService);
  private router = inject(Router);

  campi = ifspCampiSaoPaulo;
  etapa = 1;
  role: UserRole = 'estudantes';
  nome = '';
  username = '';
  email = '';
  senha = '';
  dataNascimento = '';
  campus = '';
  prontuario = '';
  curso = '';
  feedback = '';

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/feed']);
    }
  }

  get roleLabel(): string {
    return this.role === 'mentoras' ? 'Mentora' : 'Estudante';
  }

  get cursosDisponiveis(): string[] {
    return this.campi.find(campus => campus.nome === this.campus)?.cursos || [];
  }

  switchRole(ev: any) {
    this.role = ev.detail?.value || 'estudantes';
    this.feedback = '';
  }

  atualizarCampus() {
    this.curso = '';
    this.feedback = '';
  }

  voltarEtapa() {
    this.etapa = 1;
    this.feedback = '';
  }

  continuar() {
    if (!this.validarConta()) {
      return;
    }

    this.etapa = 2;
    this.feedback = '';
  }

  cadastrar() {
    if (!this.validarConta() || !this.validarVinculo()) {
      return;
    }

    const payload = {
      nome: this.nome,
      username: this.username,
      email: this.email,
      senha: this.senha,
      dataNascimento: this.dataNascimento,
      campus: this.campus,
      prontuario: this.prontuario,
      curso: this.curso,
    };

    const request = this.role === 'estudantes'
      ? this.estudanteService.create(payload)
      : this.mentoraService.create(payload);

    request.subscribe({
      next: () => this.finalizarCadastro(),
      error: () => this.finalizarCadastro(),
    });
  }

  private validarConta(): boolean {
    if (!this.nome || !this.username || !this.email || !this.senha || !this.dataNascimento) {
      this.feedback = 'Preencha todos os campos para continuar.';
      return false;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!emailValido) {
      this.feedback = 'Informe um email válido.';
      return false;
    }

    const senhaSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,18}$/.test(this.senha);
    if (!senhaSegura) {
      this.feedback = 'A senha deve ter 8 a 18 caracteres, com maiúscula, minúscula, número e caractere especial.';
      return false;
    }

    this.username = this.auth.normalizeUsername(this.username);
    if (this.username.length < 3) {
      this.feedback = 'O nome de usuário deve ter pelo menos 3 caracteres válidos.';
      return false;
    }

    if (!this.auth.isUsernameAvailable(this.username)) {
      this.feedback = 'Este nome de usuário já está em uso. Escolha outro.';
      return false;
    }

    return true;
  }

  private validarVinculo(): boolean {
    if (!this.campus || !this.prontuario || !this.curso) {
      this.feedback = 'Informe campus, prontuário e curso para concluir o cadastro.';
      return false;
    }

    const prontuarioValido = /^[a-zA-Z0-9-]{4,18}$/.test(this.prontuario.trim());
    if (!prontuarioValido) {
      this.feedback = 'Informe um prontuário válido com letras e números.';
      return false;
    }

    return true;
  }

  private finalizarCadastro() {
    const user = this.auth.registerLocal({
      nome: this.nome,
      username: this.username,
      email: this.email,
      senha: this.senha,
      dataNascimento: this.dataNascimento,
      campus: this.campus,
      prontuario: this.prontuario.trim().toUpperCase(),
      curso: this.curso,
      role: this.role,
    });

    this.auth.saveToken(String(user.id));
    this.auth.saveCurrentUser(user);
    this.feedback = 'Cadastro realizado. Redirecionando para o feed...';
    setTimeout(() => this.router.navigate(['/feed']), 450);
  }
}
