import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { LoginPage } from './login.page';
import { environment } from '../../../environments/environment';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('leva o perfil escolhido para a recuperação de senha', () => {
    component.role = 'mentoras';
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href^="/recuperar-senha"]');
    expect(link.getAttribute('href')).toBe('/recuperar-senha?perfil=mentoras');
  });

  it('mantém o login pelo serviço existente e navega para a home', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(localStorage, 'setItem');
    component.role = 'mentoras';
    component.email = 'mentora@example.test';
    component.password = 'SenhaDeTeste123';

    component.login();
    const pedido = http.expectOne(request => request.url === environment.apiUrl + 'mentoras/login');
    expect(pedido.request.params.get('email')).toBe(component.email);
    expect(pedido.request.params.get('senha')).toBe(component.password);
    pedido.flush(17);

    expect(localStorage.setItem).toHaveBeenCalledWith('userRole', 'mentoras');
    expect(localStorage.setItem).toHaveBeenCalledWith('userId', '17');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });
});
