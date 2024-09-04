export class CustomValidators {

  static MatchingPasswords(control:any) {
      const password = control.get('password').value;
      const confirmPassword = control.get('confirmPassword').value;
      const currentErrors = control.get('confirmPassword').errors
      const confirmControl = control.get('confirmPassword')

      if (compare(password, confirmPassword)) {
          confirmControl.setErrors({...currentErrors, not_matching: true});
      } else {
          confirmControl.setErrors(currentErrors)
      }
  }
}

function compare(password: string,confirmPassword: string) {
  return password !== confirmPassword && confirmPassword !== ''
}
