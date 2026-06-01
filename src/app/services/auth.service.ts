import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserRole } from '../data/mvp-data';

export interface LoginResponse {
  authenticated: boolean;
  userId: number;
  message: string;
  role?: UserRole;
  nome?: string;
  username?: string;
  email?: string;
  foto?: string;
  curso?: string;
  semestre?: string;
  bio?: string;
}

export interface LocalUser {
  id: number;
  nome: string;
  username?: string;
  email: string;
  senha: string;
  role: UserRole;
  foto?: string;
  links?: string;
  dataNascimento?: string;
  curso?: string;
  semestre?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private usersKey = 'hipatec_users';
  private currentUserKey = 'hipatec_current_user';

  login(role: UserRole, email: string, senha: string): Observable<LoginResponse> {
    const endpoint = role === 'estudantes' ? 'estudantes/login' : 'mentoras/login';
    const url = `${environment.apiUrl}${endpoint}`;
    const params = new HttpParams().set('email', email).set('senha', senha);

    return this.http.post<LoginResponse>(url, {}, { params }).pipe(
      catchError(() => of(this.loginLocal(role, email, senha)))
    );
  }

  registerLocal(user: Omit<LocalUser, 'id'>): LocalUser {
    const users = this.getUsers().filter(item => item.email !== user.email);
    const created: LocalUser = {
      id: Date.now(),
      curso: user.role === 'estudantes' ? 'Análise e Desenvolvimento de Sistemas' : 'Tecnologia e carreira',
      semestre: user.role === 'estudantes' ? '3o semestre' : 'Mentora voluntária',
      bio: user.role === 'estudantes'
        ? 'Estudante do IFSP em busca de apoio, permanência e oportunidades em tecnologia.'
        : 'Profissional voluntária apoiando estudantes mulheres em tecnologia.',
      ...user,
    };

    this.setUsers([...users, created]);
    return created;
  }

  loginLocal(role: UserRole, email: string, senha: string): LoginResponse {
    let user = this.getUsers().find(item => item.role === role && item.email === email);

    if (!user && email && senha) {
      user = this.registerLocal({
        role,
        email,
        senha,
        nome: email.split('@')[0] || 'Usuária Hipatec',
      });
    }

    if (!user || user.senha !== senha) {
      return {
        authenticated: false,
        userId: 0,
        message: 'Email ou senha inválidos.',
      };
    }

    return {
      authenticated: true,
      userId: user.id,
      message: 'Login realizado com sucesso.',
      role: user.role,
      nome: user.nome,
      username: user.username,
      email: user.email,
      foto: user.foto,
      curso: user.curso,
      semestre: user.semestre,
      bio: user.bio,
    };
  }

  saveToken(token: string) {
    try { localStorage.setItem('auth_token', token); } catch { /* ignore on private mode */ }
  }

  getToken(): string | null {
    try { return localStorage.getItem('auth_token'); } catch { return null; }
  }

  saveCurrentUser(user: Partial<LocalUser>) {
    try { localStorage.setItem(this.currentUserKey, JSON.stringify(user)); } catch { /* ignore on private mode */ }
  }

  getCurrentUser(): Partial<LocalUser> | null {
    try {
      const raw = localStorage.getItem(this.currentUserKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  updateCurrentUser(updates: Partial<LocalUser>): Partial<LocalUser> {
    const current = this.getCurrentUser() || {};
    const updated = { ...current, ...updates };
    this.saveCurrentUser(updated);

    const currentId = Number(this.getToken());
    const users = this.getUsers().map(user => user.id === currentId || user.email === current.email ? { ...user, ...updated } as LocalUser : user);
    this.setUsers(users);

    return updated;
  }

  updateEmail(email: string): { ok: boolean; message: string } {
    const current = this.getCurrentUser();
    if (!current) {
      return { ok: false, message: 'Sessão não encontrada.' };
    }

    const users = this.getUsers();
    if (users.some(user => user.email === email && user.id !== current.id)) {
      return { ok: false, message: 'Este e-mail já está em uso.' };
    }

    this.updateCurrentUser({ email });
    return { ok: true, message: 'E-mail atualizado com sucesso.' };
  }

  updatePassword(currentPassword: string, newPassword: string): { ok: boolean; message: string } {
    const current = this.getCurrentUser();
    const currentId = Number(this.getToken());
    const users = this.getUsers();
    const user = users.find(item => item.id === currentId || item.email === current?.email);

    if (user && user.senha !== currentPassword) {
      return { ok: false, message: 'Senha atual incorreta.' };
    }

    const updatedUsers = users.map(item => item.id === currentId || item.email === current?.email ? { ...item, senha: newPassword } : item);
    this.setUsers(updatedUsers);
    this.updateCurrentUser({ senha: newPassword });
    return { ok: true, message: 'Senha alterada com sucesso.' };
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  logout() {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem(this.currentUserKey);
    } catch { /* ignore */ }
  }

  private getUsers(): LocalUser[] {
    try {
      const raw = localStorage.getItem(this.usersKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private setUsers(users: LocalUser[]) {
    try { localStorage.setItem(this.usersKey, JSON.stringify(users)); } catch { /* ignore */ }
  }
}
