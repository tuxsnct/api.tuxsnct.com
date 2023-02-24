export * from 'hono/utils/encode'

/* eslint-disable no-bitwise,no-plusplus */

// eslint-disable-next-line max-statements
export const base64ToArrayBuffer = (base64: string) => {
  // eslint-disable-next-line no-secrets/no-secrets
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const lookup = new Uint8Array(256)
  for (let index = 0; index < chars.length; index++) lookup[chars.codePointAt(index) as number] = index

  const view = new Uint8Array(
    new ArrayBuffer(
      base64.length * 0.75 - (
        base64[base64.length - 1] === '='
          ? (
            base64[base64.length - 2] === '='
              ? 2
              : 1
          )
          : 0
      )
    )
  )

  const encoded = []
  let pointer = 0
  for (let index1 = 0; index1 < base64.length; index1 += 4) {
    // eslint-disable-next-line security/detect-object-injection
    for (let index2 = 0; index2 < 4; index2++) encoded[index2] = lookup[base64.codePointAt(index1 + index2) as number]

    view[pointer++] = (encoded[0] << 2) | (encoded[1] >> 4)
    view[pointer++] = ((encoded[1] & 15) << 4) | (encoded[2] >> 2)
    view[pointer++] = ((encoded[2] & 3) << 6) | (encoded[3] & 63)
  }

  return view.buffer
}

/* eslint-enable no-bitwise,no-plusplus */
