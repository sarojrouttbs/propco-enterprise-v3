import { TestBed } from '@angular/core/testing';

import { SolrSearchHandlerService } from './solr-search-handler.service';

describe('SolrSearchHandlerService', () => {
  let service: SolrSearchHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolrSearchHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
