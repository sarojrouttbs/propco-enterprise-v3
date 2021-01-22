import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AgreementClauseModalPage } from './agreement-clause-modal.page';

describe('AgreementClauseModalPage', () => {
  let component: AgreementClauseModalPage;
  let fixture: ComponentFixture<AgreementClauseModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgreementClauseModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AgreementClauseModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
