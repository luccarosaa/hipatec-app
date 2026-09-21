import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class ForgotPasswordPage {
  email: string = '';
  emailEnviado: boolean = false;

  constructor() {
    addIcons({ mailOutline });
  }

  enviarRecuperacao() {
    // Validação simples
    if (this.email.trim() !== '' && this.email.includes('@')) {
      // Futuramente: Chamar API do banco de dados aqui
      
      // Muda a tela
      this.emailEnviado = true;
    }
  }
}