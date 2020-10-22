import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchPropertyPage } from './search-property.page';

describe('SearchPropertyPage', () => {
  let component: SearchPropertyPage;
  let fixture: ComponentFixture<SearchPropertyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchPropertyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPropertyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
