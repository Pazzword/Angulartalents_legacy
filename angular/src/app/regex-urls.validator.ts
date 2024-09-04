import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class RegexCustomValidator {
  regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);
      return valid ? null : error;
    };
  }
}
