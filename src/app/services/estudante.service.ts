import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EstudanteCadastro {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstudanteService {
  private http = inject(HttpClient);

  create(estudante: EstudanteCadastro): Observable<{ message?: string }> {
    const url = `${environment.apiUrl}estudantes`;
    return this.http.post<{ message?: string }>(url, estudante);
  }
}
