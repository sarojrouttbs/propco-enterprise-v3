import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceSquareBrackets'
})
export class ReplaceSquareBracketsPipe implements PipeTransform {

  transform(value: string): string {
    if (value) {
      return value.replace(/[\[\]']+/g, '');
    }
  }

}
