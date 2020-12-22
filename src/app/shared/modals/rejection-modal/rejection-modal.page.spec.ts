import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RejectionModalPage } from './rejection-modal.page';

describe('RejectionModalPage', () => {
  let component: RejectionModalPage;
  let fixture: ComponentFixture<RejectionModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectionModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RejectionModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
