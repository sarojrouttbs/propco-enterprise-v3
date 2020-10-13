import { Injectable } from '@angular/core';
import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    let config = {
      required: 'This field is required.',
      invalidCreditCard: 'Is invalid credit card number',
      invalidPostcode: 'Please enter valid postcode.',
      invalidEmailAddress: 'Please enter valid email address.',
      invalidPassword: 'Password between 10 and 64 characters; must contain at least 1 lowercase letter, 1 uppercase letter, 1 numeric digit, and 1 special character.',
      invalidAlphaNumeric: 'Only alphanumeric values are allowed.',
      invalidContact: 'Please enter valid contact number.',
      invalidNumber: 'Please enter number only.',
      minlength: `Minimum length ${validatorValue.requiredLength}`,
      maxlength: `Maximum length ${validatorValue.requiredLength}`,
      min: `Minimum number should be greater than ${validatorValue.min}`,
      max: `Maximum number should be less than ${validatorValue.max}`,
      equalTo: 'Confirm password does not match the password',
      invalidSpecialCharacter: 'Special character not allowed',
      invalidAlphabet: 'Only alphabets are allowed',
      invalidAlphabetWithPunctuation: "Only alphabets with punctuation(',-) are allowed",
      invalidBankCode: 'Please enter valid sort code',
      whitespace: 'Please enter valid data',
      commonPassword: 'Password is too easy to guess'
    };

    return config[validatorName];
  }

  static creditCardValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
        return null;
      } else {
        return { invalidCreditCard: true };
      }
    }
  }

  static postcodeValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2}))$/)) {
        return null;
      } else {
        return { invalidPostcode: true };
      }
    }
  }



  static emailValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
        return null;
      } else {
        return { invalidEmailAddress: true };
      }
    }
  }

  static passwordValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      let regex = '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()?~_£:/<>\\\"])(?=\\S+$).{10,64}$';
      if (control.value.match(regex)) {
        return null;
      } else {
        return { invalidPassword: true };
      }
    }
  }

  static contactValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^[0-9+-]+$/)) {
        return null;
      } else {
        return { invalidContact: true };
      }
    }
  }

  static numberValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^[0-9+-]+$/)) {
        return null;
      } else {
        return { invalidNumber: true };
      }
    }
  }

  static speacialValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^[a-zA-Z.]+$/)) {
        return null;
      } else {
        return { invalidSpecialCharacter: true };
      }
    }
  }

  static alphabetValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^[a-zA-Z]+$/)) {
        return null;
      } else {
        return { invalidAlphabet: true };
      }
    }
  }

  static alphabetWithPunctuationValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^[a-zA-Z'-]+$/)) {
        return null;
      } else {
        return { invalidAlphabetWithPunctuation: true };
      }
    }
  }

  static passwordMatchValidator(g: FormGroup) {
    if (g.get('password').value === g.get('confirmPassword').value) {
      return null;
    } else {
      return { invalidPassword: true };
    }
  }

  static equalTo(equalControlName) {

    return (control): {
      [key: string]: any
    } => {
      if (!control['_parent']) { return null; }

      if (!control['_parent'].controls[equalControlName]) {
        throw new TypeError('Form Control ' + equalControlName + ' does not exists.');
      }

      const controlMatch = control['_parent'].controls[equalControlName];

      return controlMatch.value == control.value ? null : {
        equalTo: true
      };
    };
  }

  // ^(?!(?:00:00:00))(?:\d\d:\d\d:\d\d)$
  static bankCodeValidator(control) {
    if (typeof control !== 'undefined' && control.value) {
      if (control.value.match(/^(?!(?:00[:|-]00[:|-]00))(?:\d\d[:|-]\d\d[:|-]\d\d)|(?:\*\*\*\*\d[:|-]\d\d)$/)) {
        return null;
      } else {
        return { invalidBankCode: true };
      }
    }
  }

  static dateLessThan(dateField1: string, dateField2: string): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      const date1 = c.get(dateField1).value;
      const date2 = c.get(dateField2).value;
      if ((date1 !== null && date2 !== null) && (new Date(date2) < new Date(date1))) {
        return { invalidEndDate: true };
      }
      return null;
    };
  }

  static noWhitespaceValidator(control) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}
