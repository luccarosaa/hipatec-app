export type UserRole = 'estudantes' | 'mentoras';

export interface Mentoria {
  id: number;
  titulo: string;
  tema: string;
  mentora: string;
  cargo: string;
  data: string;
  horario: string;
  vagas: number;
  formato: string;
  descricao: string;
  tags: string[];
  duracao?: string;
  local?: string;
  preRequisitos?: string;
  materiais?: string;
  status?: 'agendada' | 'aberta' | 'encerrada' | 'cancelada';
  inscritas?: number;
  participantes?: string[];
  criadaPor?: string;
}

export interface FeedPost {
  id: number;
  autora: string;
  papel: string;
  tempo: string;
  texto: string;
  curtidas: number;
  comentarios: number;
  categoria: string;
  liked?: boolean;
  saved?: boolean;
}

export interface Oportunidade {
  id: number;
  titulo: string;
  organizacao: string;
  tipo: 'vaga' | 'evento' | 'oficina' | 'conteudo';
  local: string;
  prazo: string;
  descricao: string;
  tags: string[];
}

export const mentorias: Mentoria[] = [
  {
    id: 1,
    titulo: 'Primeiros passos em desenvolvimento web',
    tema: 'Frontend',
    mentora: 'Marina Lopes',
    cargo: 'Desenvolvedora Frontend na comunidade alumni IFSP',
    data: '12/06/2026',
    horario: '19h',
    vagas: 8,
    formato: 'Online',
    descricao: 'Encontro para organizar estudos, montar um primeiro portfólio e entender como praticar HTML, CSS, Angular e lógica sem se perder.',
    tags: ['HTML', 'CSS', 'Angular', 'Portfólio'],
    duracao: '1h30',
    local: 'Link enviado por email',
    status: 'aberta',
    inscritas: 4,
    participantes: ['Ana Clara', 'Júlia Mendes', 'Rafaela Souza', 'Lia Martins'],
  },
  {
    id: 2,
    titulo: 'Carreira em dados para iniciantes',
    tema: 'Dados',
    mentora: 'Bianca Santos',
    cargo: 'Analista de Dados e ex-aluna do IFSP',
    data: '18/06/2026',
    horario: '18h30',
    vagas: 6,
    formato: 'Online',
    descricao: 'Uma conversa prática sobre SQL, visualização de dados, currículo e trilhas possíveis para entrar na área de dados.',
    tags: ['SQL', 'Power BI', 'Python', 'Carreira'],
    duracao: '1h',
    local: 'Online',
    status: 'aberta',
    inscritas: 3,
    participantes: ['Beatriz Lima', 'Clara Nunes', 'Dandara Alves'],
  },
  {
    id: 3,
    titulo: 'Preparação para entrevista técnica',
    tema: 'Carreira',
    mentora: 'Camila Nogueira',
    cargo: 'Engenheira de Software',
    data: '25/06/2026',
    horario: '20h',
    vagas: 5,
    formato: 'Online',
    descricao: 'Simulação de entrevista, revisão de comunicação técnica e estratégias para lidar com insegurança e ansiedade no processo seletivo.',
    tags: ['Entrevista', 'Currículo', 'LinkedIn', 'Confiança'],
    duracao: '1h15',
    local: 'Google Meet',
    status: 'agendada',
    inscritas: 2,
    participantes: ['Ana Clara', 'Júlia Mendes'],
  },
];

export const feedPosts: FeedPost[] = [
  {
    id: 1,
    autora: 'Ana Clara',
    papel: 'Aluna de ADS',
    tempo: '2h',
    texto: 'Consegui finalizar meu primeiro CRUD em Angular. O que mais me ajudou foi quebrar a tarefa em telas pequenas e pedir revisão no grupo.',
    curtidas: 28,
    comentarios: 6,
    categoria: 'conquista',
  },
  {
    id: 2,
    autora: 'Marina Lopes',
    papel: 'Mentora',
    tempo: '1d',
    texto: 'Abri horários para revisar portfólio esta semana. Quem estiver procurando estágio pode levar GitHub, currículo ou só dúvidas mesmo.',
    curtidas: 43,
    comentarios: 12,
    categoria: 'mentoria',
  },
  {
    id: 3,
    autora: 'Júlia Mendes',
    papel: 'Aluna de Redes',
    tempo: '3d',
    texto: 'Alguém estudando banco de dados para a prova? Podemos montar uma sessão rápida de exercícios depois da aula.',
    curtidas: 19,
    comentarios: 9,
    categoria: 'apoio',
  },
];

export const oportunidades: Oportunidade[] = [
  {
    id: 1,
    titulo: 'Programa de estágio afirmativo em tecnologia',
    organizacao: 'Núcleo de Empregabilidade IFSP',
    tipo: 'vaga',
    local: 'Remoto',
    prazo: 'Inscrições até 20/06',
    descricao: 'Seleção voltada para estudantes mulheres em cursos de tecnologia, com trilha de desenvolvimento e mentoria.',
    tags: ['Estágio', 'Afirmativa', 'Remoto'],
  },
  {
    id: 2,
    titulo: 'Oficina de Git e GitHub para projetos acadêmicos',
    organizacao: 'Hipatec',
    tipo: 'oficina',
    local: 'Laboratório 3',
    prazo: '14/06, 10h',
    descricao: 'Atividade prática para versionar trabalhos, colaborar em equipe e publicar um README apresentável.',
    tags: ['Git', 'GitHub', 'Portfólio'],
  },
  {
    id: 3,
    titulo: 'Roda de conversa: permanência feminina na computação',
    organizacao: 'Coletivo de alunas IFSP',
    tipo: 'evento',
    local: 'Auditório',
    prazo: '28/06, 18h',
    descricao: 'Encontro aberto para troca de experiências, acolhimento e construção de estratégias de permanência.',
    tags: ['Comunidade', 'Permanência', 'Representatividade'],
  },
  {
    id: 4,
    titulo: 'Guia de currículo para primeira vaga tech',
    organizacao: 'Curadoria Hipatec',
    tipo: 'conteudo',
    local: 'Online',
    prazo: 'Disponível agora',
    descricao: 'Checklist simples para organizar experiências acadêmicas, projetos, habilidades e links profissionais.',
    tags: ['Currículo', 'Carreira', 'Primeira vaga'],
  },
];

export const apoioMateriais = [
  {
    titulo: 'Acolhimento acadêmico',
    descricao: 'Orientações para buscar coordenação, docentes, assistência estudantil e canais institucionais do IFSP.',
  },
  {
    titulo: 'Como pedir ajuda técnica',
    descricao: 'Modelo de mensagem para explicar erro, contexto, prints e o que já foi tentado antes de pedir apoio.',
  },
  {
    titulo: 'Permanência e saúde emocional',
    descricao: 'Lista de práticas, grupos e contatos úteis para momentos de sobrecarga ou isolamento no curso.',
  },
];
