import { errorType } from "../models/form-error"

export const errorMessages: errorType = {
  firstName: "[First name] - is required",
  lastName: "[Last name] - is required",
  tagLine: "[Tag line] - is required",
  bio: "[Bio] - is required",
  city: "[City] - is required",
  country: "[Country] - is required",
  location: "[Location] - is required",
  avatar: "[Avatar] - is requred",
  searchStatus: "[Seach status] option must be selected",
  roleType: "[Role types] options are required be selected",
  roleLevel: "[Role level] options are required be selected",
  github: "[Github] - is required",
  linkedIn: "[LinkedIn] - is required",
}

export const regexErrorMessage: errorType = {
  http: "[Website] - Url has to be without 'https://', instead use: use: www.example.com or example.com",
  invalidUrl: "[Website] - Url is invalid: instead use: www.example.com or example.com ",
  httpGithub: "[Github] - Url has to be without 'https://', instead use: use: www.example.com or example.com",
  httpTwitter: "[Twitter] - Url has to be without 'https://', instead use: use: www.example.com or example.com",
  usernameWithoutSymbols: "* [Github] - Url is invalid: use your github profile name without symbols",
  usernameWithoutSymbolsTwitter: "* [Twitter] - Url is invalid: use your twitter profile name without symbols",
  httpLinkedIn: "[LinkedIn] - Url has to be without 'https://', instead use: use: www.example.com or example.com",
  usernameWithoutSymbolsLinkedIn: "* [LinkedIn] - Url is invalid: use your github profile name without symbols",
  httpStack: "[Stackoverflow] - Url has to be without 'https://', instead use: use: www.example.com or example.com",
  usernameWithoutSymbolsStack: "* [Stackoverflow] - Url is invalid: use your github profile name without symbols",
}

export const recruiterErrorMessages: errorType = {
  firstName: "[First name] - is required",
  lastName: "[Last name] - is required",
  company: "[Company] - is required",
  website: "[Website] - is requred",
  bio: "[Bio] - is required",
  logo: "[Logo] - is requred",
  role: "[Role] - is requred",
  linkedIn: "[LinkedIn] - is required",
}
