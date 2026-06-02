import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { getPainelItemById, PainelLearningItem } from '../../data/painel-items';
import { loadInscritas, saveInscritas } from '../../data/mentorias-store';

@Component({
  selector: 'app-painel-detail',
  standalone: true,
  imports: [CommonModule, IonContent, NavbarComponent, FooterComponent],
  templateUrl: './painel-detail.page.html',
  styleUrls: ['./painel-detail.page.scss'],
})
export class PainelDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  item?: PainelLearningItem;
  feedback = '';
  inscricoesPainel: string[] = [];
  inscritasMentorias: number[] = [];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.item = getPainelItemById(id);
    this.inscricoesPainel = this.loadPainelInscricoes();
    this.inscritasMentorias = loadInscritas();
  }

  get isInscrito(): boolean {
    if (!this.item) {
      return false;
    }

    if (this.item.kind === 'mentoria' && this.item.sourceId) {
      return this.inscritasMentorias.includes(this.item.sourceId);
    }

    return this.inscricoesPainel.includes(this.item.id);
  }

  get actionLabel(): string {
    if (!this.item) {
      return 'Inscrever-se';
    }

    if (this.isInscrito) {
      return this.item.kind === 'guia' ? 'Remover dos salvos' : 'Cancelar inscrição';
    }

    return this.item.kind === 'guia' ? 'Salvar conteúdo' : 'Inscrever-se';
  }

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    this.router.navigate(['/painel']);
  }

  alternarInscricao() {
    if (!this.item) {
      return;
    }

    if (this.item.kind === 'mentoria' && this.item.sourceId) {
      const wasInscrito = this.isInscrito;
      this.inscritasMentorias = wasInscrito
        ? this.inscritasMentorias.filter(id => id !== this.item?.sourceId)
        : [...this.inscritasMentorias, this.item.sourceId];
      saveInscritas(this.inscritasMentorias);
      this.feedback = wasInscrito ? 'Inscrição cancelada.' : 'Inscrição confirmada.';
      return;
    }

    const wasInscrito = this.isInscrito;
    this.inscricoesPainel = wasInscrito
      ? this.inscricoesPainel.filter(id => id !== this.item?.id)
      : [...this.inscricoesPainel, this.item.id];
    this.savePainelInscricoes();
    this.feedback = wasInscrito ? 'Atualização removida.' : 'Atualização salva.';
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
      // Mantem a alteracao apenas em memoria se localStorage falhar.
    }
  }
}
