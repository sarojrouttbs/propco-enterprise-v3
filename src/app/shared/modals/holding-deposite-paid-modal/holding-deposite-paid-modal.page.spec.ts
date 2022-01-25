import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HoldingDepositePaidModalPage } from './holding-deposite-paid-modal.page';

describe('HoldingDepositePaidModalPage', () => {
  let component: HoldingDepositePaidModalPage;
  let fixture: ComponentFixture<HoldingDepositePaidModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HoldingDepositePaidModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HoldingDepositePaidModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
