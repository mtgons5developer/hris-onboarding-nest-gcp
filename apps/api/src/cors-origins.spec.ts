import { corsAllowlist, isAllowedCorsOrigin, isHrisPagesPreviewOrigin } from './cors-origins';

describe('cors-origins', () => {
  const list = corsAllowlist();

  it('allows local Vite and production Pages hosts', () => {
    expect(isAllowedCorsOrigin('http://localhost:5173', list)).toBe(true);
    expect(isAllowedCorsOrigin('https://admin.getlakbay.com', list)).toBe(true);
    expect(isAllowedCorsOrigin('https://hris-onboarding.pages.dev', list)).toBe(true);
  });

  it('allows this project’s Pages preview hosts only', () => {
    expect(isHrisPagesPreviewOrigin('https://abc123.hris-admin.pages.dev')).toBe(true);
    expect(isHrisPagesPreviewOrigin('https://other.pages.dev')).toBe(false);
    expect(isAllowedCorsOrigin('https://abc123.hris-onboarding.pages.dev', list)).toBe(true);
  });

  it('merges extra CORS_ORIGINS without dropping defaults', () => {
    const merged = corsAllowlist('https://extra.example');
    expect(merged).toContain('https://admin.getlakbay.com');
    expect(merged).toContain('https://extra.example');
  });
});
