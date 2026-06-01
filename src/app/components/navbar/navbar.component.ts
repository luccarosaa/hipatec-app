import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class NavbarComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  nome = 'Hipatec';
  foto = '';
  menuOpen = false;
  userMenuOpen = false;

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.nome = user?.nome || 'Hipatec';
    this.foto = user?.foto || '';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu(event?: Event) {
    event?.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    this.menuOpen = false;
  }

  closeMenu() {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/home']);
  }
}
