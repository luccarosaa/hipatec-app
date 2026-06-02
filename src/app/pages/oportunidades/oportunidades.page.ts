import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Oportunidade, oportunidades } from '../../data/mvp-data';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-oportunidades',
  templateUrl: './oportunidades.page.html',
  styleUrls: ['./oportunidades.page.scss'],
  standalone: true,
  imports: [FooterComponent, IonContent, CommonModule, FormsModule, NavbarComponent, RouterLink],
})
export class OportunidadesPage {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  vagas = this.mergeVagas(oportunidades.filter(item => item.tipo === 'vaga'), this.loadAdminVagas());
  termo = '';
  tipoVaga = '';
  formato = '';
  local = '';
  estado = '';
  cidade = '';
  area = '';

  constructor() {
    this.route.queryParamMap.subscribe(params => this.termo = params.get('q') || '');
  }

  get tiposVaga(): string[] {
    return this.options('tipoVaga');
  }

  get formatos(): string[] {
    return this.options('formato');
  }

  get locais(): string[] {
    return this.options('local');
  }

  get estados(): string[] {
    return this.options('estado');
  }

  get cidades(): string[] {
    const vagas = this.estado ? this.vagas.filter(item => item.estado === this.estado) : this.vagas;
    return Array.from(new Set(vagas.map(item => item.cidade).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
  }

  get areas(): string[] {
    return this.options('area');
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  get filtradas(): Oportunidade[] {
    const q = this.normalize(this.termo);
    return this.vagas.filter(item => {
      const matchesSearch = !q || this.normalize(`${item.titulo} ${item.organizacao} ${item.local} ${item.descricao} ${item.tags.join(' ')} ${item.area || ''}`).includes(q);
      return matchesSearch
        && this.matches(this.tipoVaga, item.tipoVaga)
        && this.matches(this.formato, item.formato)
        && this.matches(this.local, item.local)
        && this.matches(this.estado, item.estado)
        && this.matches(this.cidade, item.cidade)
        && this.matches(this.area, item.area);
    });
  }

  atualizarEstado() {
    this.cidade = '';
  }

  limparFiltros() {
    this.tipoVaga = '';
    this.formato = '';
    this.local = '';
    this.estado = '';
    this.cidade = '';
    this.area = '';
  }

  private mergeVagas(base: Oportunidade[], admin: Oportunidade[]): Oportunidade[] {
    const overrides = new Map(admin.map(item => [item.id, item]));
    const mergedBase = base.map(item => overrides.get(item.id) || item);
    const extraAdmin = admin.filter(item => !base.some(baseItem => baseItem.id === item.id));
    return [...mergedBase, ...extraAdmin];
  }

  private loadAdminVagas(): Oportunidade[] {
    try {
      const raw = localStorage.getItem('hipatec_admin_vagas');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private matches(filter: string, value?: string): boolean {
    return !filter || value === filter;
  }

  private options(key: keyof Oportunidade): string[] {
    return Array.from(new Set(this.vagas.map(item => item[key]).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
