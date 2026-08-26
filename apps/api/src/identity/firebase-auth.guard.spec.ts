import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseAuthGuard } from './firebase-auth.guard';

describe('FirebaseAuthGuard', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const firebase = { verifyIdToken: jest.fn() };
  const config = { get: jest.fn() };

  function makeGuard() {
    return new FirebaseAuthGuard(
      config as unknown as ConfigService,
      prisma as never,
      firebase as never,
    );
  }

  function ctx(auth?: string) {
    const req: { headers: Record<string, string>; user?: unknown } = {
      headers: auth ? { authorization: auth } : {},
    };
    return {
      switchToHttp: () => ({ getRequest: () => req }),
      req,
    };
  }

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('rejects missing bearer token', async () => {
    const { ctx: c } = { ctx: ctx() };
    await expect(makeGuard().canActivate(c as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('resolves seeded dev user when bypass is on', async () => {
    config.get.mockReturnValue('true');
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      firebaseUid: 'dev-hr-admin',
      role: 'hr_admin',
    });
    const wrapper = ctx('Bearer dev:hr_admin');
    const ok = await makeGuard().canActivate(wrapper as never);
    expect(ok).toBe(true);
    expect(wrapper.req.user).toMatchObject({ firebaseUid: 'dev-hr-admin' });
  });

  it('denies unknown dev token', async () => {
    config.get.mockReturnValue('true');
    const wrapper = ctx('Bearer dev:hacker');
    await expect(makeGuard().canActivate(wrapper as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
