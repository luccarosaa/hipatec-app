import { apoioMateriais, Mentoria, Oportunidade, oportunidades } from './mvp-data';
import { loadAllMentorias } from './mentorias-store';

export type PainelItemKind = 'mentoria' | 'atividade' | 'guia' | 'curso';

export interface PainelInfoItem {
  label: string;
  value: string;
}

export interface PainelLearningItem {
  id: string;
  kind: PainelItemKind;
  label: string;
  title: string;
  description: string;
  detail: string;
  meta: string;
  tags: string[];
  info: PainelInfoItem[];
  sourceId?: number;
}

export interface PainelCursoFuturo {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  tags: string[];
}

export const painelCursosFuturos: PainelCursoFuturo[] = [
  {
    id: 'curso-introducao-tecnologia',
    titulo: 'Trilha de introdução à tecnologia',
    descricao: 'Espaço reservado para conteúdos estruturados que podem entrar em uma próxima fase.',
    status: 'Em planejamento',
    tags: ['Base técnica', 'Carreira'],
  },
  {
    id: 'curso-primeira-vaga',
    titulo: 'Preparação para primeira vaga',
    descricao: 'Conteúdos futuros para organizar portfólio, currículo e rotina de estudos.',
    status: 'Em planejamento',
    tags: ['Portfólio', 'Currículo'],
  },
];

export function painelItemId(prefix: string, value: string | number): string {
  return `${prefix}-${slug(String(value))}`;
}

export function getPainelItemById(id: string): PainelLearningItem | undefined {
  return buildPainelItems().find(item => item.id === id);
}

export function buildPainelItems(): PainelLearningItem[] {
  return [
    ...loadAllMentorias().filter(item => item.status !== 'cancelada').map(mentoriaToPainelItem),
    ...oportunidades.filter(item => item.tipo !== 'vaga').map(oportunidadeToPainelItem),
    ...apoioMateriais.map(guiaToPainelItem),
    ...painelCursosFuturos.map(cursoToPainelItem),
  ];
}

function mentoriaToPainelItem(item: Mentoria): PainelLearningItem {
  return {
    id: painelItemId('mentoria', item.id),
    kind: 'mentoria',
    label: item.tema,
    title: item.titulo,
    description: item.descricao,
    detail: `${item.descricao} A proposta é apoiar organização de estudos, troca com a mentora e próximos passos práticos dentro da comunidade Hipatec.`,
    meta: `${item.mentora} • ${item.data} às ${item.horario}`,
    tags: item.tags,
    sourceId: item.id,
    info: [
      { label: 'Mentora', value: item.mentora },
      { label: 'Data', value: `${item.data} às ${item.horario}` },
      { label: 'Formato', value: item.formato },
      { label: 'Duração', value: item.duracao || 'A confirmar' },
      { label: 'Local/link', value: item.local || 'Enviado após inscrição' },
      { label: 'Vagas', value: String(item.vagas) },
    ],
  };
}

function oportunidadeToPainelItem(item: Oportunidade): PainelLearningItem {
  return {
    id: painelItemId('oportunidade', item.id),
    kind: 'atividade',
    label: item.tipo,
    title: item.titulo,
    description: item.descricao,
    detail: `${item.descricao} Esta atividade aparece no painel para facilitar o acompanhamento de oportunidades formativas e materiais oficiais da Hipatec.`,
    meta: `${item.local} • ${item.prazo}`,
    tags: item.tags,
    sourceId: item.id,
    info: [
      { label: 'Organização', value: item.organizacao },
      { label: 'Tipo', value: item.tipo },
      { label: 'Local', value: item.local },
      { label: 'Prazo', value: item.prazo },
    ],
  };
}

function guiaToPainelItem(item: { titulo: string; descricao: string }): PainelLearningItem {
  return {
    id: painelItemId('guia', item.titulo),
    kind: 'guia',
    label: 'Guia',
    title: item.titulo,
    description: item.descricao,
    detail: `${item.descricao} Use este guia como ponto de partida para organizar pedidos de ajuda, permanência acadêmica e próximos passos.`,
    meta: 'Conteúdo oficial Hipatec',
    tags: ['Apoio', 'Permanência'],
    info: [
      { label: 'Origem', value: 'Curadoria Hipatec' },
      { label: 'Formato', value: 'Guia rápido' },
      { label: 'Disponibilidade', value: 'Disponível agora' },
    ],
  };
}

function cursoToPainelItem(item: PainelCursoFuturo): PainelLearningItem {
  return {
    id: item.id,
    kind: 'curso',
    label: item.status,
    title: item.titulo,
    description: item.descricao,
    detail: `${item.descricao} Esta trilha fica registrada apenas como planejamento futuro e não representa uma área completa de cursos no MVP.`,
    meta: 'Trilha Hipatec',
    tags: item.tags,
    info: [
      { label: 'Status', value: item.status },
      { label: 'Formato', value: 'Planejado' },
      { label: 'Escopo', value: 'Futuro' },
    ],
  };
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
