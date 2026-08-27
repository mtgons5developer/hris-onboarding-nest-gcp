import { isLocalDevBypassRequest } from './dev-bypass';

describe('isLocalDevBypassRequest', () => {
  it('allows dev tokens on localhost', () => {
    expect(
      isLocalDevBypassRequest('true', { host: 'localhost:3000' }),
    ).toBe(true);
  });

  it('allows dev tokens on private LAN (Flutter physical device → Mac Nest)', () => {
    expect(
      isLocalDevBypassRequest('true', { host: '192.168.0.4:3000' }),
    ).toBe(true);
    expect(
      isLocalDevBypassRequest('true', { host: '10.0.2.2:3000' }),
    ).toBe(true);
  });

  it('rejects dev tokens on the public tunnel host', () => {
    expect(
      isLocalDevBypassRequest('true', { host: 'api.getlakbay.com' }),
    ).toBe(false);
  });

  it('rejects when AUTH_DEV_BYPASS is not true', () => {
    expect(
      isLocalDevBypassRequest('false', { host: 'localhost:3000' }),
    ).toBe(false);
  });

  it('rejects dev tokens when Origin is a public site', () => {
    expect(
      isLocalDevBypassRequest('true', {
        host: 'localhost:3000',
        origin: 'https://admin.getlakbay.com',
      }),
    ).toBe(false);
  });
});
