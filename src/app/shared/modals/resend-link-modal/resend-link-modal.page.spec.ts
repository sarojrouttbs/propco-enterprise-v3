import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResendLinkModalPage } from './resend-link-modal.page';

describe('ResendLinkModalPage', () => {
  let component: ResendLinkModalPage;
  let fixture: ComponentFixture<ResendLinkModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResendLinkModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResendLinkModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
