import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LetAlliancePage } from './let-alliance.page';

describe('LetAlliancePage', () => {
  let component: LetAlliancePage;
  let fixture: ComponentFixture<LetAlliancePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LetAlliancePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LetAlliancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
