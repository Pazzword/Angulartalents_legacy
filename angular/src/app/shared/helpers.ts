import { errorMessages, recruiterErrorMessages, regexErrorMessage } from "./error-messages"

export const recruiterErrorMessageGenerator = (controls:any) =>{
  let errors = []
  for(var key in controls){
    //key = firstName, lastName, etc
    // ctrs[key].status = valid, invalid
    if(controls[key].status === "INVALID"){
      errors.push(recruiterErrorMessages[key])
    }
  }
  return errors;
}

export const errorMessageGenerator = (controls:any) =>{
  let errors = []
  for(var key in controls){
    //key = firstName, lastName, etc
    // ctrs[key].status = valid, invalid
    if(controls[key].status === "INVALID"){
      errors.push(errorMessages[key])
    }
  }

  if(controls['website'].hasError('http')){
    errors.push(regexErrorMessage['http'])
  }
  if(controls['website'].hasError('url')){
    errors.push(regexErrorMessage['invalidUrl'])
  }
  if(controls['github'].hasError('username')){
    errors.push(regexErrorMessage['usernameWithoutSymbols'])
  }
  if(controls['github'].hasError('http')){
    errors.push(regexErrorMessage['httpGithub'])
  }
  if(controls['twitter'].hasError('http')){
    errors.push(regexErrorMessage['httpTwitter'])
  }
  if(controls['twitter'].hasError('username')){
    errors.push(regexErrorMessage['usernameWithoutSymbolsTwitter'])
  }
  if(controls['linkedIn'].hasError('http')){
    errors.push(regexErrorMessage['httpLinkedIn'])
  }
  if(controls['linkedIn'].hasError('username')){
    errors.push(regexErrorMessage['usernameWithoutSymbolsLinkedIn'])
  }
  if(controls['stackoverflow'].hasError('http')){
    errors.push(regexErrorMessage['httpStack'])
  }
  if(controls['stackoverflow'].hasError('username')){
    errors.push(regexErrorMessage['usernameWithoutSymbolsStack'])
  }

  return errors

}
