import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, finalize } from 'rxjs';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.page.html',
  styleUrls: ['../login/login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IonLabel, IonSegment, IonSegmentButton],
})
export class RecuperarSenhaPage implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  perfil: 'estudantes' | 'mentoras' = 'estudantes';
  email = '';
  senha = '';
  confirmacao = '';
  redefinir = false;
  linkValido = false;
  enviando = false;
  concluido = false;
  erro = '';
  private token = '';
  private requisicao?: Subscription;

  ngOnInit(): void {
    this.perfil = this.route.snapshot.queryParamMap.get('perfil') === 'mentoras' ? 'mentoras' : 'estudantes';
    this.redefinir = this.route.snapshot.data['redefinir'] === true;
    if (this.redefinir) {
      this.token = new URLSearchParams(this.route.snapshot.fragment ?? '').get('token') ?? '';
      this.linkValido = /^[A-Za-z0-9_-]{43}$/.test(this.token);
      // O fragmento não vai ao servidor; removê-lo também evita mantê-lo no histórico.
      this.location.replaceState('/redefinir-senha');
    }
  }

  enviar(form: NgForm): void {
    if (this.enviando || this.concluido) {
      return;
    }

    this.erro = '';
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.erro = 'Confira os campos antes de continuar.';
      return;
    }
    if (this.redefinir && (!this.linkValido || this.senha !== this.confirmacao)) {
      this.erro = this.linkValido ? 'As senhas precisam ser iguais.' : 'Solicite um novo link de recuperação.';
      return;
    }
    if (this.redefinir && this.senha.trim().length === 0) {
      this.erro = 'A senha não pode conter apenas espaços.';
      return;
    }
    if (this.redefinir && new TextEncoder().encode(this.senha).length > 72) {
      this.erro = 'Essa senha é muito longa. Use menos caracteres; acentos e emojis ocupam mais espaço.';
      return;
    }
    this.enviando = true;
    const pedido = this.redefinir
      ? this.auth.redefinirSenha(this.token, this.senha)
      : this.auth.solicitarRecuperacao(this.perfil, this.email.trim());
    this.requisicao = pedido.pipe(finalize(() => {
      this.enviando = false;
    })).subscribe({
      next: () => {
        this.concluido = true;
        this.limparSenha();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 429) {
          this.erro = 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.';
        } else if (this.redefinir && error.status === 422) {
          this.erro = 'Use pelo menos 8 caracteres. Se a senha for muito longa, reduza seu tamanho.';
        } else if (this.redefinir && error.status === 400) {
          this.linkValido = false;
          this.limparSenha();
          this.erro = 'O link é inválido, expirou ou já foi utilizado. Solicite um novo link.';
        } else {
          this.erro = 'Não foi possível concluir agora. Verifique sua conexão e tente novamente.';
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.requisicao?.unsubscribe();
    this.limparSenha();
  }

  private limparSenha(): void {
    this.token = '';
    this.senha = '';
    this.confirmacao = '';
  }
}
