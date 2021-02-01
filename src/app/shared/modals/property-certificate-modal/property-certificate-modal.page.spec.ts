import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PropertyCertificateModalPage } from './property-certificate-modal.page';

describe('PropertyCetificateModalPage', () => {
  let component: PropertyCertificateModalPage;
  let fixture: ComponentFixture<PropertyCertificateModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyCertificateModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyCertificateModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
