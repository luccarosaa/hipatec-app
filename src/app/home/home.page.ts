import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../components/footer/footer.component';
import { mentorias, oportunidades } from '../data/mvp-data';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, FooterComponent],
})
export class HomePage {
  mentoriasDestaque = mentorias.slice(0, 3);
  oportunidadesDestaque = oportunidades.slice(0, 3);
  showAccessInvite = false;
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  scrollToSection(sectionId: string, event?: Event) {
    event?.preventDefault();
    this.closeMenu();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  openAccessInvite(event?: Event) {
    event?.preventDefault();
    this.showAccessInvite = true;
  }

  closeAccessInvite() {
    this.showAccessInvite = false;
  }
}
