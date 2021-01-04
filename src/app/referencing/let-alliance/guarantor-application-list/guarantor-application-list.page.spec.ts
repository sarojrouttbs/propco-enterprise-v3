import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GuarantorApplicationListPage } from './guarantor-application-list.page';

describe('GuarantorApplicationListPage', () => {
  let component: GuarantorApplicationListPage;
  let fixture: ComponentFixture<GuarantorApplicationListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuarantorApplicationListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GuarantorApplicationListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
