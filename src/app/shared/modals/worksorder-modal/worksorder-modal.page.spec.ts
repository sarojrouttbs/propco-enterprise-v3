import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksorderModalPage } from './worksorder-modal.page';

describe('WorksorderModalPage', () => {
  let component: WorksorderModalPage;
  let fixture: ComponentFixture<WorksorderModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorksorderModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksorderModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
