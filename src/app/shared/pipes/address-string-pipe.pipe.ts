import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'address'
})
export class AddressPipe implements PipeTransform {

  transform(addressObject: any): string {
    let addressDetails = null;
    if (addressObject && addressObject != null) {
      addressDetails = (
        (addressObject.addressLine1 ? addressObject.addressLine1 + ', ' : '') +
        (addressObject.addressLine2 ? addressObject.addressLine2 + ', ' : '') +
        (addressObject.town ? addressObject.town + ', ' : '') +
        (addressObject.county ? addressObject.county + ', ' : '') +
        (addressObject.country ? addressObject.country + ', ' : '') +
        (addressObject.postcode ? addressObject.postcode + '' : '')
      );
    }
    return addressDetails;
  }

}