import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro.page').then(m => m.CadastroPage),
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage),
  },
  {
    path: 'dashboard',
    redirectTo: 'painel',
    pathMatch: 'full',
  },
  {
    path: 'painel/itens/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/painel-detail/painel-detail.page').then(m => m.PainelDetailPage),
  },
  {
    path: 'painel',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/painel/painel.page').then(m => m.PainelPage),
  },
  {
    path: 'posts/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/post-detail/post-detail.page').then(m => m.PostDetailPage),
  },
  {
    path: 'mentorias',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mentorias/mentorias.page').then(m => m.MentoriasPage),
  },
  {
    path: 'mentorias/gerenciar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mentorias-manage/mentorias-manage.page').then(m => m.MentoriasManagePage),
  },
  {
    path: 'minhas-mentorias',
    redirectTo: 'mentorias/gerenciar',
    pathMatch: 'full',
  },
  {
    path: 'mentorias/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mentoria-detail/mentoria-detail.page').then(m => m.MentoriaDetailPage),
  },
  {
    path: 'oportunidades',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/oportunidades/oportunidades.page').then(m => m.OportunidadesPage),
  },
  {
    path: 'vagas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/oportunidades/oportunidades.page').then(m => m.OportunidadesPage),
  },
  {
    path: 'apoio',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/apoio/apoio.page').then(m => m.ApoioPage),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'perfil/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-edit/profile-edit.page').then(m => m.ProfileEditPage),
  },
  {
    path: 'perfil/:username',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
  },
  {
    path: 'configuracoes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/configuracoes/configuracoes.page').then(m => m.ConfiguracoesPage),
  },
  {
    path: 'profile',
    redirectTo: 'perfil',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
