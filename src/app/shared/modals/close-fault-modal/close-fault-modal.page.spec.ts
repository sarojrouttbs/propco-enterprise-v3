import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CloseFaultModalPage } from './close-fault-modal.page';

describe('CloseFaultModalPage', () => {
  let component: CloseFaultModalPage;
  let fixture: ComponentFixture<CloseFaultModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseFaultModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CloseFaultModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
