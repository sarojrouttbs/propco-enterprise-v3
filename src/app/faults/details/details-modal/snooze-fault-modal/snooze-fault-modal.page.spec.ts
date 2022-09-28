import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SnoozeFaultModalPage } from './snooze-fault-modal.page';

describe('SnoozeFaultModalPage', () => {
  let component: SnoozeFaultModalPage;
  let fixture: ComponentFixture<SnoozeFaultModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SnoozeFaultModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SnoozeFaultModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
