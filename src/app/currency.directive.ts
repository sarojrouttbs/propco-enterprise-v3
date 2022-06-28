import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCurrency]'
})
export class CurrencyDirective {
  private prefix: string;
  private decimalSeparator: string;
  private thousandsSeparator: string;

  constructor(public ngControl: NgControl) {
    this.prefix = '£';
    this.decimalSeparator = '.';
    this.thousandsSeparator = ',';
  }

  @HostListener('change', ['$event.target.value'])
  onModelChange(value) {
    this.transform(value);
  }

  // Prevent user to enter anything but digits and decimal separator
  @HostListener('keypress', ['$event'])
  onKeyPress(event) {
    const key = event.which || event.keyCode || 0;
    if (key !== 46 && key > 31 && (key < 48 || key > 57)) {
      event.preventDefault();
    }
  }

  transform(value: string, decimalPrecision: number = 2) {
    if (value == undefined || value === '') {
      return null;
    }
    if (value.indexOf(',') != -1) {
      value = this.parse(value);
    }

    let [integer, fraction = ''] = (value || '').toString().split(this.decimalSeparator);
    fraction = decimalPrecision > 0 ? this.decimalSeparator + (fraction + '000000').substring(0, 2) : '';
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
    // If user types .xx we can display 0.xx
    if (integer === '') {
      integer = '0';
    } else if (integer.startsWith('£')) {
      // If there are multiple transforms, remove the previous pound sign (blur and change at the same time)
      integer = integer.substr(1, integer.length);
    }
    this.ngControl.valueAccessor.writeValue(this.prefix + integer + fraction);
  }

  parse(value: string) {
    let [integer, fraction = ''] = (value || '').split(this.decimalSeparator);
    integer = integer.replace(new RegExp(/[^\d\.]/, 'g'), '');
    fraction = parseInt(fraction, 10) > 0 && 2 > 0 ? this.decimalSeparator + (fraction + '000000').substring(0, 2) : '';
    return integer + fraction;
  }

}
