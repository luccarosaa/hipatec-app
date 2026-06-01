import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { apoioMateriais } from '../../data/mvp-data';

@Component({
  selector: 'app-apoio',
  templateUrl: './apoio.page.html',
  styleUrls: ['./apoio.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, NavbarComponent],
})
export class ApoioPage {
  materiais = apoioMateriais;
  assunto = '';
  mensagem = '';
  feedback = '';

  enviar() {
    if (!this.assunto || !this.mensagem) {
      this.feedback = 'Preencha assunto e mensagem para registrar seu pedido de apoio.';
      return;
    }

    this.feedback = 'Pedido registrado no protótipo. Uma pessoa da rede Hipatec entraria em contato.';
    this.assunto = '';
    this.mensagem = '';
  }
}
