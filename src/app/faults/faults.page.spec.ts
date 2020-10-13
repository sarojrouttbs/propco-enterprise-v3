import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FaultsPage } from './faults.page';

describe('FaultsPage', () => {
  let component: FaultsPage;
  let fixture: ComponentFixture<FaultsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaultsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FaultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
