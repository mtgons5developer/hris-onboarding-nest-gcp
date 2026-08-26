import { audienceMatches, emailFromClaims, roleFromClaims } from './claims';

describe('roleFromClaims', () => {
  it('reads Keycloak realm roles', () => {
    expect(roleFromClaims({ realm_access: { roles: ['offline_access', 'hr_admin'] } })).toBe(
      'hr_admin',
    );
  });

  it('reads Cognito groups', () => {
    expect(roleFromClaims({ 'cognito:groups': ['employee'] })).toBe('employee');
  });

  it('ignores unknown roles', () => {
    expect(roleFromClaims({ realm_access: { roles: ['uma_authorization'] } })).toBeUndefined();
  });
});

describe('audienceMatches', () => {
  it('accepts Cognito access token client_id among comma-separated audiences', () => {
    expect(
      audienceMatches(
        { client_id: '4ij7jqehds0m6s1ubss1aj7710' },
        '604evnknhtitgpltjdo90ghm7l,4ij7jqehds0m6s1ubss1aj7710',
      ),
    ).toBe(true);
  });

  it('accepts ID token aud', () => {
    expect(audienceMatches({ aud: '604evnknhtitgpltjdo90ghm7l' }, '604evnknhtitgpltjdo90ghm7l')).toBe(
      true,
    );
  });

  it('rejects unknown clients', () => {
    expect(audienceMatches({ client_id: 'other' }, '604evnknhtitgpltjdo90ghm7l')).toBe(false);
  });
});

describe('emailFromClaims', () => {
  it('reads email on ID tokens', () => {
    expect(emailFromClaims({ email: 'hr@lab.local', username: '79da553c-uuid' })).toBe('hr@lab.local');
  });

  it('falls back to email-shaped username', () => {
    expect(emailFromClaims({ username: 'luis.reyes@lab.local' })).toBe('luis.reyes@lab.local');
  });

  it('ignores Cognito UUID usernames', () => {
    expect(emailFromClaims({ username: '79da553c-8081-70a7-6078-9d87a1cc6449' })).toBeUndefined();
  });
});
