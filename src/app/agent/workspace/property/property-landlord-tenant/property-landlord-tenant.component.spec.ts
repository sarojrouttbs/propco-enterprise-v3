import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PropertyLandlordTenantComponent } from './property-landlord-tenant.component';

describe('PropertyLandlordTenantComponent', () => {
  let component: PropertyLandlordTenantComponent;
  let fixture: ComponentFixture<PropertyLandlordTenantComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyLandlordTenantComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyLandlordTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
