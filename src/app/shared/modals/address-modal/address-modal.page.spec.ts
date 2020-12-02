import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddressModalPage } from './address-modal.page';

describe('AddressModalPage', () => {
  let component: AddressModalPage;
  let fixture: ComponentFixture<AddressModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
