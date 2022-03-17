import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "RemainingCountPipe",
})
export class RemainingCountPipe implements PipeTransform {
  transform(value: any, type: string = ''): string {
    if (value) {
      if(type === 'onlyString'){
        value = value.split(',');
      }
      if (value.length === 1) {
        return value[0];
      } else {
        return `${value[0]} +${value.length - 1}`;
      }
    }
  }
}
