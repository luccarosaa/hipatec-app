import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { apoioMateriais, Mentoria, Oportunidade, oportunidades } from '../../data/mvp-data';
import { painelCursosFuturos, painelItemId } from '../../data/painel-items';
import { loadAllMentorias, loadInscritas, saveInscritas } from '../../data/mentorias-store';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, NavbarComponent, FooterComponent],
  templateUrl: './painel.page.html',
  styleUrls: ['./painel.page.scss'],
})
export class PainelPage implements OnInit {
  private route = inject(ActivatedRoute);

  termo = '';
  mentorias: Mentoria[] = [];
  inscritas: number[] = [];
  oficinas: Oportunidade[] = [];
  guias = apoioMateriais;
  cursos = painelCursosFuturos;
  feedback = '';
  inscricoesPainel: string[] = [];

  ngOnInit() {
    this.inscritas = loadInscritas();
    this.inscricoesPainel = this.loadPainelInscricoes();
    this.route.queryParamMap.subscribe(params => {
      this.termo = params.get('q') || '';
      this.carregarConteudo();
    });
  }

  get mentoriasSugeridas(): Mentoria[] {
    return this.mentorias.filter(item => !this.isInscrita(item.id)).slice(0, 3);
  }

  get oficinasFiltradas(): Oportunidade[] {
    return this.oficinas.slice(0, 3);
  }

  get guiasFiltrados() {
    return this.guias.filter(item => this.matches(`${item.titulo} ${item.descricao}`)).slice(0, 3);
  }

  isInscrita(id: number): boolean {
    return this.inscritas.includes(id);
  }

  isPainelInscrito(key: string): boolean {
    return this.inscricoesPainel.includes(key);
  }

  alternarInscricaoPainel(key: string, titulo: string) {
    if (this.isPainelInscrito(key)) {
      this.inscricoesPainel = this.inscricoesPainel.filter(item => item !== key);
      this.feedback = `Inscrição cancelada em ${titulo}.`;
    } else {
      this.inscricoesPainel = [...this.inscricoesPainel, key];
      this.feedback = `Inscrição confirmada em ${titulo}.`;
    }

    this.savePainelInscricoes();
  }

  inscrever(mentoria: Mentoria) {
    if (!this.isInscrita(mentoria.id)) {
      this.inscritas = [...this.inscritas, mentoria.id];
      saveInscritas(this.inscritas);
    }

    this.feedback = `Inscrição confirmada em ${mentoria.titulo}.`;
  }

  painelKey(prefix: string, value: string): string {
    return `${prefix}-${this.normalize(value).replace(/\s+/g, '-')}`;
  }

  painelItemId(prefix: string, value: string | number): string {
    return painelItemId(prefix, value);
  }

  private carregarConteudo() {
    this.mentorias = loadAllMentorias()
      .filter(item => item.status !== 'cancelada')
      .filter(item => this.matches(`${item.titulo} ${item.tema} ${item.mentora} ${item.descricao} ${item.tags.join(' ')}`));
    this.oficinas = oportunidades
      .filter(item => item.tipo !== 'vaga')
      .filter(item => this.matches(`${item.titulo} ${item.organizacao} ${item.tipo} ${item.descricao} ${item.tags.join(' ')}`));
  }

  private matches(value: string): boolean {
    const q = this.normalize(this.termo);
    return !q || this.normalize(value).includes(q);
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private loadPainelInscricoes(): string[] {
    try {
      const raw = localStorage.getItem('hipatec_painel_inscricoes');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private savePainelInscricoes() {
    try {
      localStorage.setItem('hipatec_painel_inscricoes', JSON.stringify(this.inscricoesPainel));
    } catch {
      // Mantem o feedback visual mesmo sem persistencia local.
    }
  }
}

