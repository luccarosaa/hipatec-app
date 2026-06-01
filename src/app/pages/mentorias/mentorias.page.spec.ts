import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MentoriasPage } from './mentorias.page';

describe('MentoriasPage', () => {
  let component: MentoriasPage;
  let fixture: ComponentFixture<MentoriasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentoriasPage],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MentoriasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
