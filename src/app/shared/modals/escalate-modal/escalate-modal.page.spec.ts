import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EscalateModalPage } from './escalate-modal.page';

describe('EscalateModalPage', () => {
  let component: EscalateModalPage;
  let fixture: ComponentFixture<EscalateModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EscalateModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EscalateModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
