import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, decodeJwt } from 'jose';
import {
  buildIssuerJwksConfigs,
  IdentityProviderService,
  splitOidcEnvList,
} from './identity-provider.service';

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn((url: URL) => `jwks:${url.toString()}`),
  jwtVerify: jest.fn(),
  decodeJwt: jest.fn(),
}));

describe('splitOidcEnvList', () => {
  it('splits comma-separated values', () => {
    expect(splitOidcEnvList('a, b ,c')).toEqual(['a', 'b', 'c']);
  });
});

describe('buildIssuerJwksConfigs', () => {
  it('pairs issuers with jwks by index', () => {
    const configs = buildIssuerJwksConfigs(
      ['https://cognito/jwks.json', 'http://localhost:8082/certs'],
      ['https://cognito/pool', 'http://localhost:8082/realms/hris'],
    );
    expect(configs).toHaveLength(2);
    expect(configs[0].issuer).toBe('https://cognito/pool');
    expect(configs[1].issuer).toBe('http://localhost:8082/realms/hris');
  });
});

describe('IdentityProviderService', () => {
  const config = { get: jest.fn() };
  const mockedVerify = jwtVerify as jest.MockedFunction<typeof jwtVerify>;
  const mockedDecode = decodeJwt as jest.MockedFunction<typeof decodeJwt>;

  function makeService() {
    const svc = new IdentityProviderService(config as unknown as ConfigService);
    svc.onModuleInit();
    return svc;
  }

  beforeEach(() => {
    jest.resetAllMocks();
    config.get.mockImplementation((key: string) => {
      if (key === 'OIDC_JWKS_URI') {
        return 'https://cognito/jwks.json,http://localhost:8082/certs';
      }
      if (key === 'OIDC_ISSUER') {
        return 'https://cognito/pool,http://localhost:8082/realms/hris';
      }
      if (key === 'OIDC_AUDIENCE') return '604evnknhtitgpltjdo90ghm7l,hris-web,account';
      return undefined;
    });
  });

  it('verifies using the issuer from the token first', async () => {
    mockedDecode.mockReturnValue({ iss: 'http://localhost:8082/realms/hris' });
    mockedVerify.mockResolvedValueOnce({
      payload: { sub: 'kc-sub', email: 'hr@lab.local', azp: 'hris-web', aud: 'account' },
      protectedHeader: { alg: 'RS256' },
    });
    const identity = await makeService().verifyAccessToken('token');
    expect(identity.sub).toBe('kc-sub');
    expect(mockedVerify.mock.calls[0]?.[2]).toEqual(
      expect.objectContaining({ issuer: 'http://localhost:8082/realms/hris' }),
    );
  });

  it('falls back to the next issuer when signature verification fails', async () => {
    mockedDecode.mockReturnValue({ iss: 'https://cognito/pool' });
    mockedVerify
      .mockRejectedValueOnce(new Error('bad sig'))
      .mockResolvedValueOnce({
        payload: { sub: 'cog-sub', aud: '604evnknhtitgpltjdo90ghm7l', email: 'hr@lab.local' },
        protectedHeader: { alg: 'RS256' },
      });
    const identity = await makeService().verifyAccessToken('token');
    expect(identity.sub).toBe('cog-sub');
    expect(mockedVerify).toHaveBeenCalledTimes(2);
  });

  it('rejects unknown audience after a valid signature', async () => {
    mockedDecode.mockReturnValue({ iss: 'https://cognito/pool' });
    mockedVerify.mockResolvedValueOnce({
      payload: { sub: 'cog-sub', aud: 'wrong-client' },
      protectedHeader: { alg: 'RS256' },
    });
    await expect(makeService().verifyAccessToken('token')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('wraps verification failures as invalid access token', async () => {
    mockedDecode.mockReturnValue({ iss: 'https://cognito/pool' });
    mockedVerify.mockRejectedValue(new Error('bad sig'));
    await expect(makeService().verifyAccessToken('token')).rejects.toThrow('Invalid access token');
  });
});
