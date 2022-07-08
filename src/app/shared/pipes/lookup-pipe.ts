import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lookup'
})
export class LookupPipe implements PipeTransform {
  transform(index: any, lookupArray: any): string {
    let value: any;
    if (lookupArray && lookupArray.length) {
      lookupArray.find((obj) => {
        if (obj.index == index) {
          value = obj.value;
        }
      });
    }
    return value;
  }
}
