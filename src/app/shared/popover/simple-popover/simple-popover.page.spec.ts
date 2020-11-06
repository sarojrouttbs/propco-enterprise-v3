import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SimplePopoverPage } from './simple-popover.page';

describe('SimplePopoverPage', () => {
  let component: SimplePopoverPage;
  let fixture: ComponentFixture<SimplePopoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimplePopoverPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SimplePopoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
