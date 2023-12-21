const atob = (str: string) => Buffer.from(str, 'base64').toString('binary')
const btoa = (str: string) => Buffer.from(str, 'binary').toString('base64')

export const BASE_64 = {
  encode: btoa,
  decode: atob,
}
