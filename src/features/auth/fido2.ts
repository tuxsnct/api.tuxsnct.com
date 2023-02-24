import { Fido2Lib } from '@tuxsnct/fido2-lib'

export const fido2 = new Fido2Lib({
  attestation: 'none',
  authenticatorAttachment: 'cross-platform',
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: 'discouraged',
  rpId: 'localhost',
  rpName: 'tuxsnct',
  timeout: 30_000
})
