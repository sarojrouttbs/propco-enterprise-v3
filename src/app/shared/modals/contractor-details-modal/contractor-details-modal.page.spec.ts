import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContractorDetailsModalPage } from './contractor-details-modal.page';

describe('ContractorDetailsModalPage', () => {
  let component: ContractorDetailsModalPage;
  let fixture: ComponentFixture<ContractorDetailsModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractorDetailsModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContractorDetailsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
