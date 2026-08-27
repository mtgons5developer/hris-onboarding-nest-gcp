export function createRemoteJWKSet() {
  return async () => ({});
}

export async function jwtVerify() {
  throw new Error('jose stub — tests should not verify real JWTs');
}

export function decodeJwt() {
  throw new Error('jose stub — decodeJwt not configured');
}
