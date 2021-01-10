import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WithoutPrepaymentModalComponent } from './without-prepayment-modal.component';

describe('WithoutPrepaymentModalComponent', () => {
  let component: WithoutPrepaymentModalComponent;
  let fixture: ComponentFixture<WithoutPrepaymentModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithoutPrepaymentModalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WithoutPrepaymentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
