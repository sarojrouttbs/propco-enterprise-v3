import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppoinmentModalPage } from './appoinment-modal.page';

describe('AppoinmentModalPage', () => {
  let component: AppoinmentModalPage;
  let fixture: ComponentFixture<AppoinmentModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppoinmentModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppoinmentModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
