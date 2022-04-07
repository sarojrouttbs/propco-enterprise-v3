import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-property-landlord-tenant',
  templateUrl: './property-landlord-tenant.component.html',
  styleUrls: ['./property-landlord-tenant.component.scss'],
})
export class PropertyLandlordTenantComponent implements OnInit {

  landlordList: any = [{ "status": 1, 
  "address": {
     "addressLine1": "11 Sutcliffe Drive", "addressLine2": "Harbury", "addressLine3": null, "county": "Warwickshire", "country": "United Kingdom", "street": null, "buildingName": null, "buildingNumber": null, "postcode": "CV33 9LT", "latitude": null, "longitude": null, "locality": null, "town": "Leamington Spa", "pafReference": "5997865.00" },
      "name": "Mr Shane Gillis", 
      "addressee": "Mr Gillis", 
      "homeTelephoneNo": "07809123311", 
      "businessTelephoneNo": "33432423",
       "alternativeEmail": "sakshi.singla@techblue.co.uk",
        "dateOfBirth": "1989-08-31", 
        "email": "ali.rollason@techblue.co.uk", 
        "mobile": "07805553123", 
        "createdAt": "2021-10-20 14:34:10",
         "modifiedAt": "2022-03-08 11:12:34", 
         "reference": null, 
         "legacyReference": null, 
         "rentPercentage": 100, 
         "propertyLinkStatus": "Current",
          "title": "Mr", 
          "forename": "Shane",
           "middlename": "Garret", 
           "surname": "Gillis", 
           "fullName": "Mr Shane Gillis", 
           "isLead": true, "propcoId": "2075", "landlordId": "0b6c4fba-7c67-4247-851f-c8d3e5bce413" }];
  constructor() { }

  ngOnInit() { 
    
  }

}
