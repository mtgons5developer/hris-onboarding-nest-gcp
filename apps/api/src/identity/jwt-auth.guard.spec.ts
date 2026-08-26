import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const idp = { verifyAccessToken: jest.fn() };
  const config = { get: jest.fn() };

  function makeGuard() {
    return new JwtAuthGuard(config as unknown as ConfigService, prisma as never, idp as never);
  }

  function ctx(auth?: string, headers: Record<string, string> = { host: 'localhost:3000' }) {
    const req: { headers: Record<string, string>; user?: unknown } = {
      headers: auth ? { authorization: auth, ...headers } : { ...headers },
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
    await expect(makeGuard().canActivate(ctx() as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('resolves seeded dev user when bypass is on', async () => {
    config.get.mockReturnValue('true');
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      idpSub: 'dev-hr-admin',
      role: 'hr_admin',
    });
    const wrapper = ctx('Bearer dev:hr_admin');
    const ok = await makeGuard().canActivate(wrapper as never);
    expect(ok).toBe(true);
    expect(wrapper.req.user).toMatchObject({ idpSub: 'dev-hr-admin' });
  });

  it('denies unknown dev token', async () => {
    config.get.mockReturnValue('true');
    await expect(makeGuard().canActivate(ctx('Bearer dev:hacker') as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('ignores bypass on the public tunnel Host', async () => {
    config.get.mockReturnValue('true');
    idp.verifyAccessToken.mockRejectedValue(new UnauthorizedException('Invalid access token'));
    await expect(
      makeGuard().canActivate(
        ctx('Bearer dev:hr_admin', {
          host: 'api.getlakbay.com',
          origin: 'https://admin.getlakbay.com',
        }) as never,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(idp.verifyAccessToken).toHaveBeenCalledWith('dev:hr_admin');
  });

  it('ignores bypass when Host is local but Origin is Pages', async () => {
    config.get.mockReturnValue('true');
    idp.verifyAccessToken.mockRejectedValue(new UnauthorizedException('Invalid access token'));
    await expect(
      makeGuard().canActivate(
        ctx('Bearer dev:hr_admin', {
          host: 'localhost:3000',
          origin: 'https://admin.getlakbay.com',
        }) as never,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
