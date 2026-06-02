import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../data/mvp-data';

interface LearningItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, RouterLinkActive]
})
export class NavbarComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  nome = 'Hipatec';
  foto = '';
  role: UserRole = 'estudantes';
  searchTerm = '';
  menuOpen = false;
  userMenuOpen = false;
  learningMenuOpen = false;
  isAdmin = false;

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.nome = user?.nome || 'Hipatec';
    this.foto = user?.foto || '';
    this.role = user?.role || 'estudantes';
    this.isAdmin = this.auth.isAdmin();
    this.searchTerm = this.currentQuery();
  }

  get learningItems(): LearningItem[] {
    const baseItems = [
      { label: 'Painel', route: '/painel' },
      { label: 'Meu aprendizado', route: '/mentorias' },
    ];

    return this.role === 'mentoras'
      ? [...baseItems, { label: 'Minhas mentorias', route: '/mentorias/gerenciar' }]
      : baseItems;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.userMenuOpen = false;
    this.learningMenuOpen = false;
  }

  toggleLearningMenu(event?: Event) {
    event?.stopPropagation();
    this.learningMenuOpen = !this.learningMenuOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu(event?: Event) {
    event?.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    this.menuOpen = false;
    this.learningMenuOpen = false;
  }

  closeMenu() {
    this.menuOpen = false;
    this.userMenuOpen = false;
    this.learningMenuOpen = false;
  }

  submitSearch() {
    const q = this.searchTerm.trim();
    this.router.navigate([this.searchTarget()], q ? { queryParams: { q } } : { queryParams: {} });
    this.closeMenu();
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/home']);
  }

  private searchTarget(): string {
    const path = this.router.url.split('?')[0];

    if (path.startsWith('/painel')) {
      return '/painel';
    }

    if (path.startsWith('/mentorias')) {
      return '/mentorias';
    }

    if (path.startsWith('/oportunidades') || path.startsWith('/vagas')) {
      return '/vagas';
    }

    if (path.startsWith('/apoio')) {
      return '/apoio';
    }

    return '/feed';
  }

  private currentQuery(): string {
    try {
      return new URLSearchParams(this.router.url.split('?')[1] || '').get('q') || '';
    } catch {
      return '';
    }
  }
}
