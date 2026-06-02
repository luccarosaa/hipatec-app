export interface IfspCampus {
  nome: string;
  cursos: string[];
}

export const ifspCampiSaoPaulo: IfspCampus[] = [
  {
    nome: 'Câmpus São Paulo',
    cursos: [
      'Técnico Integrado em Informática',
      'Técnico Integrado em Mecânica',
      'Técnico em Edificações',
      'Tecnologia em Análise e Desenvolvimento de Sistemas',
      'Engenharia de Controle e Automação',
      'Engenharia Civil',
      'Licenciatura em Física',
      'Licenciatura em Matemática',
      'Especialização em Educação Profissional e Tecnológica',
      'Mestrado Profissional em Ensino de Ciências e Matemática',
    ],
  },
  {
    nome: 'Câmpus São Paulo - Pirituba',
    cursos: [
      'Técnico Integrado em Redes de Computadores',
      'Técnico Integrado em Administração',
      'Técnico em Logística',
      'Tecnologia em Análise e Desenvolvimento de Sistemas',
      'Tecnologia em Gestão Pública',
      'Licenciatura em Letras',
      'Engenharia de Produção',
      'Especialização em Humanidades',
    ],
  },
  {
    nome: 'Câmpus São Paulo - São Miguel Paulista',
    cursos: [
      'Técnico Integrado em Informática para Internet',
      'Técnico Integrado em Administração',
      'Técnico em Comunicação Visual',
      'Tecnologia em Gestão Pública',
      'Licenciatura em Letras',
      'Especialização em Docência para a Educação Profissional',
    ],
  },
];
