import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[postcode-validator]'
})
export class PostcodeDirective {
  constructor(public ngControl: NgControl) {
  }

  @HostListener('change', ['$event.target.value'])
  onModelChange(value) {
    if (value && (value !== undefined || value !== '')) {
      this.transform(value);
    }
  }

  transform(value: string) {
    if (value == undefined || value === '') {
      return null;
    }
    if (value.includes(' ')) {
      value = value.replace(/\s/g, "");
    }
    value = value.toUpperCase();
    const newPostCode = value.replace(/^(.*)(\d)/, "$1 $2");
    if (/^([aA-pPrR-uUwWyYzZ0-9][aA-hHkK-yY0-9][aAeEhHmMnNpPrRtTvVxXyY0-9]?[aAbBeEhHmMnNpPrRvVwWxXyY0-9]? {1}[0-9][aAbBdD-hHjJlLnN-uUwW-zZ]{2}|gGiIrR 0aAaA)$/
      .test(value) || /^([aA-pPrR-uUwWyYzZ0-9][aA-hHkK-yY0-9][aAeEhHmMnNpPrRtTvVxXyY0-9]?[aAbBeEhHmMnNpPrRvVwWxXyY0-9]? {1}[0-9][aAbBdD-hHjJlLnN-uUwW-zZ]{2}|gGiIrR 0aAaA)$/
        .test(newPostCode)) {
      this.ngControl.control.setValue(newPostCode);
    } else {
      this.ngControl.control.setErrors({ invalidPostcode: true });
    }
  }
}
