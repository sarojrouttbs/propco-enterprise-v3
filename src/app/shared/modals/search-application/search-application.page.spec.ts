import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SearchApplicationPage } from './search-application.page';

describe('SearchApplicationPage', () => {
  let component: SearchApplicationPage;
  let fixture: ComponentFixture<SearchApplicationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchApplicationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchApplicationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
