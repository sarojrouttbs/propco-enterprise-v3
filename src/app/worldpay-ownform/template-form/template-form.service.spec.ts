import { TestBed } from '@angular/core/testing';

import { TemplateFormService } from './template-form.service';

describe('TemplateFormService', () => {
  let service: TemplateFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
