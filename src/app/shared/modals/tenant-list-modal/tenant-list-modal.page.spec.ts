import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TenantListModalPage } from './tenant-list-modal.page';

describe('TenantListModalPage', () => {
  let component: TenantListModalPage;
  let fixture: ComponentFixture<TenantListModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenantListModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TenantListModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
