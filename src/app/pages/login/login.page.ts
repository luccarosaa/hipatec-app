import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../data/mvp-data';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonLabel, IonSegment, IonSegmentButton, CommonModule, FormsModule, RouterLink]
})
export class LoginPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  role: UserRole = 'estudantes';
  email = '';
  password = '';
  feedback = '';

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate([this.route.snapshot.queryParamMap.get('redirect') || '/feed']);
    }
  }

  switchRole(ev: any) {
    this.role = ev.detail?.value || 'estudantes';
    this.feedback = '';
  }

  login() {
    if (!this.email || !this.password) {
      this.feedback = 'Informe email e senha para continuar.';
      return;
    }

    this.auth.login(this.role, this.email, this.password)
      .subscribe({
        next: response => {
          if (!response.authenticated) {
            this.feedback = response.message || 'Email ou senha inválidos.';
            return;
          }

          this.auth.saveToken(String(response.userId));
          this.auth.saveCurrentUser({
            id: response.userId,
            nome: response.nome || this.email.split('@')[0],
            username: response.username,
            email: response.email || this.email,
            role: response.role || this.role,
            foto: response.foto,
            curso: response.curso,
            campus: response.campus,
            prontuario: response.prontuario,
            semestre: response.semestre,
            bio: response.bio,
            isAdmin: response.isAdmin,
          });
          this.router.navigate([this.route.snapshot.queryParamMap.get('redirect') || '/feed']);
        },
        error: () => {
          this.feedback = 'Não foi possível entrar agora. Tente novamente.';
        }
      });
  }
}
