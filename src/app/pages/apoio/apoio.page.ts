import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { apoioMateriais } from '../../data/mvp-data';

@Component({
  selector: 'app-apoio',
  templateUrl: './apoio.page.html',
  styleUrls: ['./apoio.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, RouterLink, NavbarComponent],
})
export class ApoioPage {
  private route = inject(ActivatedRoute);
  materiais = apoioMateriais;
  termo = '';
  assunto = '';
  mensagem = '';
  feedback = '';

  constructor() {
    this.route.queryParamMap.subscribe(params => this.termo = params.get('q') || '');
  }

  get materiaisFiltrados() {
    const q = this.normalize(this.termo);
    return q
      ? this.materiais.filter(item => this.normalize(`${item.titulo} ${item.descricao}`).includes(q))
      : this.materiais;
  }

  enviar() {
    if (!this.assunto || !this.mensagem) {
      this.feedback = 'Preencha assunto e mensagem para registrar seu pedido de apoio.';
      return;
    }

    this.feedback = 'Pedido registrado. A rede Hipatec poderá orientar o próximo passo.';
    this.assunto = '';
    this.mensagem = '';
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
