import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Oportunidade, oportunidades } from '../../data/mvp-data';

@Component({
  selector: 'app-oportunidades',
  templateUrl: './oportunidades.page.html',
  styleUrls: ['./oportunidades.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, NavbarComponent],
})
export class OportunidadesPage {
  filtro = 'todas';
  oportunidades = oportunidades;

  get filtradas(): Oportunidade[] {
    if (this.filtro === 'todas') {
      return this.oportunidades;
    }

    return this.oportunidades.filter(item => item.tipo === this.filtro);
  }
}
