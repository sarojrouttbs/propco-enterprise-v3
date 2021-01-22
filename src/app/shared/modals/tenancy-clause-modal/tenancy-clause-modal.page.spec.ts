import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TenancyClauseModalPage } from './tenancy-clause-modal.page';

describe('TenancyClauseModalPage', () => {
  let component: TenancyClauseModalPage;
  let fixture: ComponentFixture<TenancyClauseModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenancyClauseModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TenancyClauseModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
