import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "showRemainingCount",
})
export class ShowRemainingCountPipe implements PipeTransform {
  transform(value: Array<string>): string {
    if (value) {
      if (value.length === 1) {
        return value[0];
      } else {
        return `${value[0]} +${value.length - 1}`;
      }
    }
  }
}
