import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { FooterComponent } from '../components/footer/footer.component';
import { mentorias, oportunidades } from '../data/mvp-data';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, FooterComponent],
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  mentoriasDestaque = mentorias.slice(0, 3);
  oportunidadesDestaque = oportunidades.slice(0, 3);
  showAccessInvite = false;

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/feed']);
    }
  }

  scrollToSection(sectionId: string, event?: Event) {
    event?.preventDefault();
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
