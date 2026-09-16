import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { RecuperarSenhaPage } from './recuperar-senha.page';
import { environment } from '../../../environments/environment';

describe('Recuperação de senha', () => {
  const token = 'a'.repeat(43);
  let http: HttpTestingController;

  async function tela(redefinir = false, fragment: string | null = null) {
    await TestBed.configureTestingModule({
      imports: [RecuperarSenhaPage],
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: {
          snapshot: { data: { redefinir }, fragment, queryParamMap: convertToParamMap({ perfil: 'mentoras' }) },
        } },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    const location = TestBed.inject(Location);
    spyOn(location, 'replaceState');
    const fixture = TestBed.createComponent(RecuperarSenhaPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const preencher = async (campo: string, valor: string) => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#' + campo);
      input.value = valor;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const enviar = () => {
      fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();
    };
    return { fixture, preencher, enviar, location };
  }

  afterEach(() => http?.verify());

  it('envia perfil e e-mail, bloqueia envio repetido e mostra confirmação genérica', async () => {
    const { fixture, preencher, enviar } = await tela();
    await preencher('email', 'mentora@example.test');
    enviar();
    expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
    enviar();
    const req = http.expectOne(environment.apiUrl + 'auth/recuperacao-senha');
    expect(req.request.body).toEqual({ perfil: 'mentoras', email: 'mentora@example.test' });
    expect(req.request.method).toBe('POST');
    req.flush(null, { status: 202, statusText: 'Accepted' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Se houver uma conta');
  });

  it('não envia formulário sem e-mail válido', async () => {
    const { fixture, preencher, enviar } = await tela();
    await preencher('email', 'email-invalido');
    enviar();
    http.expectNone(environment.apiUrl + 'auth/recuperacao-senha');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Confira');
  });

  it('retira token da URL, rejeita confirmação diferente e redefine a senha', async () => {
    const { fixture, preencher, enviar, location } = await tela(true, 'token=' + token);
    expect(location.replaceState).toHaveBeenCalledWith('/redefinir-senha');
    await preencher('senha', 'NovaSenha123!');
    await preencher('confirmacao', 'OutraSenha123!');
    enviar();
    http.expectNone(environment.apiUrl + 'auth/redefinir-senha');
    expect(fixture.componentInstance.erro).toContain('iguais');
    await preencher('confirmacao', 'NovaSenha123!');
    enviar();
    const req = http.expectOne(environment.apiUrl + 'auth/redefinir-senha');
    expect(req.request.body).toEqual({ token, senha: 'NovaSenha123!' });
    expect(req.request.urlWithParams).not.toContain(token);
    req.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();
    expect(fixture.componentInstance.senha).toBe('');
    expect(fixture.nativeElement.textContent).toContain('Senha alterada com sucesso');
  });

  it('recusa senha que ultrapassa o limite em bytes', async () => {
    const { fixture, preencher, enviar } = await tela(true, 'token=' + token);
    await preencher('senha', 'á'.repeat(40));
    await preencher('confirmacao', 'á'.repeat(40));
    enviar();
    http.expectNone(environment.apiUrl + 'auth/redefinir-senha');
    expect(fixture.componentInstance.erro).toContain('muito longa');
  });

  it('orienta a solicitar outro link quando o token está ausente', async () => {
    const { fixture } = await tela(true);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="/recuperar-senha"]')).not.toBeNull();
  });

  it('trata expiração e limpa os campos de senha', async () => {
    const { fixture, preencher, enviar } = await tela(true, 'token=' + token);
    await preencher('senha', 'NovaSenha123!');
    await preencher('confirmacao', 'NovaSenha123!');
    enviar();
    http.expectOne(environment.apiUrl + 'auth/redefinir-senha')
      .flush({}, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('expirou');
    expect(fixture.componentInstance.senha).toBe('');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('permite tentar novamente após falha de rede e explica o limite de tentativas', async () => {
    const { fixture, preencher, enviar } = await tela();
    await preencher('email', 'mentora@example.test');
    enviar();
    http.expectOne(environment.apiUrl + 'auth/recuperacao-senha').error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.componentInstance.enviando).toBeFalse();
    expect(fixture.componentInstance.erro).toContain('conexão');
    enviar();
    http.expectOne(environment.apiUrl + 'auth/recuperacao-senha')
      .flush({}, { status: 429, statusText: 'Too Many Requests' });
    fixture.detectChanges();
    expect(fixture.componentInstance.erro).toContain('15 minutos');
  });

  it('mantém o link disponível quando o backend rejeita somente a senha', async () => {
    const { fixture, preencher, enviar } = await tela(true, 'token=' + token);
    await preencher('senha', 'NovaSenha123!');
    await preencher('confirmacao', 'NovaSenha123!');
    enviar();
    http.expectOne(environment.apiUrl + 'auth/redefinir-senha')
      .flush({}, { status: 422, statusText: 'Unprocessable Content' });
    fixture.detectChanges();
    expect(fixture.componentInstance.linkValido).toBeTrue();
    expect(fixture.nativeElement.querySelector('form')).not.toBeNull();
    expect(fixture.componentInstance.erro).toContain('8 caracteres');
  });
});
