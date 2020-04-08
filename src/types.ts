export interface Substance {
  name: string,
  amount?: string,
  casNumber?: string,
  location: number,
  place: string,
  number: number,
  _id?: number,
  company?: string
}

export interface LoginData {
  name: string,
  password: string
}

export interface QueryStringData {
  search: {
    type: string,
    value: string,
  },
  locations: number[]
}

export enum ErrorStatus {
  OK,
  DUPLICATE_CAS_NUMBER,
  LOADING_FAILED,
  WRONG_LOGIN_DATA
}

export enum AuthorizationStatus {
  AUTH,
  NO_AUTH
}
