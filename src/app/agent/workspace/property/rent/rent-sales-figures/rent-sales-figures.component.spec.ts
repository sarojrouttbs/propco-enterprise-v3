import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RentSalesFiguresComponent } from './rent-sales-figures.component';

describe('RentSalesFiguresComponent', () => {
  let component: RentSalesFiguresComponent;
  let fixture: ComponentFixture<RentSalesFiguresComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RentSalesFiguresComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RentSalesFiguresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
