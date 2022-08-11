import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import { REGEX } from '../constants';

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
    if (value === undefined || value === '') {
      return null;
    }
    if (value.includes(' ')) {
      value = value.replace(/\s/g, "");
    }
    value = value.toUpperCase();
    const newPostCode = value.replace(/^(.*)(\d)/, "$1 $2");
    if (new RegExp(REGEX.POSTCODE_VALIDATOR_REGX).test(value) || new RegExp(REGEX.POSTCODE_VALIDATOR_REGX).test(newPostCode)) {
      this.ngControl.control.setValue(newPostCode);
    } else {
      this.ngControl.control.setErrors({ invalidPostcode: true });
    }
  }
}
