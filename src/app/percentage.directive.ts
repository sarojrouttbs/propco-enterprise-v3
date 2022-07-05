import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[percentage-validator]'
})
export class PercentageDirective {

  private postfix: string;

  constructor(public ngControl: NgControl) {
    this.postfix = '%';
  }

  @HostListener('change', ['$event.target.value'])
  onModelChange(value) {
    this.transform(value);
  }

  @HostListener('ionFocus', ['$event.target.value'])
  onFocus(value) {
    this.parse(value, true);
  }
  @HostListener('ionBlur', ['$event.target.value'])
  onFocus2(value) {
    this.parse(value, false);
  }

  // Prevent user to enter anything but digits and decimal separator
  @HostListener('keypress', ['$event'])
  onKeyPress(event) {
    const key = event.which || event.keyCode || 0;
    if (key !== 46 && key > 31 && (key < 48 || key > 57)) {
      event.preventDefault();
    }
  }

  transform(value: string) {
    if (value == undefined || value === '') {
      return null;
    }
    if (!value.match(/^\d{0,5}(\.\d{1,2})?$/)) {
      this.ngControl.control.setErrors({ "invalidPattern": true });
    }
  }

  parse(value: string, isParse: boolean) {
    if (value == undefined || value === '') {
      return null;
    }
    if (value.indexOf('%') != -1 && isParse) {
      value = value.replace(/[%]/g, '');
      this.ngControl.valueAccessor.writeValue(value);
    } else {
      if (value.match(/^\d{0,5}(\.\d{1,2})?$/)) {
        this.ngControl.valueAccessor.writeValue(value + this.postfix);
      }
    }
  }
}
