export interface PostComment {
  id: number;
  autora: string;
  texto: string;
  data: string;
}

const COMMENTS_PREFIX = 'hipatec_comments_';

const defaultComments: Record<number, PostComment[]> = {
  1: [
    { id: 1, autora: 'Marina Lopes', texto: 'Parabéns! Seu próximo passo pode ser publicar esse CRUD no GitHub com README.', data: '1h' },
    { id: 2, autora: 'Júlia Mendes', texto: 'Também estou estudando Angular. Podemos trocar referências.', data: '35min' },
  ],
  2: [
    { id: 3, autora: 'Ana Clara', texto: 'Tenho interesse em revisar meu portfólio. Posso levar um repositório simples?', data: '18h' },
  ],
  3: [
    { id: 4, autora: 'Bianca Santos', texto: 'Posso separar alguns exercícios de SQL para vocês treinarem juntas.', data: '1d' },
  ],
};

export function loadPostComments(postId: number): PostComment[] {
  try {
    const raw = localStorage.getItem(`${COMMENTS_PREFIX}${postId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Usa os mocks quando o localStorage nao estiver disponivel.
  }

  return defaultComments[postId]?.map(comment => ({ ...comment })) || [];
}

export function savePostComments(postId: number, comments: PostComment[]) {
  try { localStorage.setItem(`${COMMENTS_PREFIX}${postId}`, JSON.stringify(comments)); } catch { /* ignore */ }
}

export function getPostCommentCount(postId: number): number {
  return loadPostComments(postId).length;
}

export function deletePostComment(postId: number, commentId: number): PostComment[] {
  const next = loadPostComments(postId).filter(comment => comment.id !== commentId);
  savePostComments(postId, next);
  return next;
}
