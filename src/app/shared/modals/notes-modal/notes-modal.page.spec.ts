import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesModalPage } from './notes-modal.page';

describe('NotesModalPage', () => {
  let component: NotesModalPage;
  let fixture: ComponentFixture<NotesModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotesModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
