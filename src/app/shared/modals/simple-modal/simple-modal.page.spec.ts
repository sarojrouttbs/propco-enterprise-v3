import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleModalPage } from './simple-modal.page';

describe('SimpleModalPage', () => {
  let component: SimpleModalPage;
  let fixture: ComponentFixture<SimpleModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
