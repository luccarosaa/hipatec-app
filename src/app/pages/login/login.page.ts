import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonLabel, IonSegment, IonSegmentButton, CommonModule, FormsModule, RouterLink]
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  role: 'estudantes' | 'mentoras' = 'estudantes';
  email = '';
  password = '';

  switchRole(ev: any) {
    this.role = ev.detail?.value || 'estudantes';
    this.email = '';
    this.password = '';
  }

  login() {
    if (!this.email || !this.password) {
      alert('Informe email e senha para continuar.');
      return;
    }

    this.auth.login(this.role, this.email, this.password)
      .subscribe({
        next: (id) => {

          localStorage.setItem('userRole', this.role);
          localStorage.setItem('userId', id.toString());

          this.router.navigate(['/home']);
        },
        error: (err) => {
          alert('Email ou senha inválidos');
          console.error(err);
        }
      });
  }

}
