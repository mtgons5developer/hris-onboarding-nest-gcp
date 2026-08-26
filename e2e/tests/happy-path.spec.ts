import { expect, test } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const API = process.env.API_URL ?? 'http://localhost:3000';

test('GET /health is 200', async ({ request }) => {
  const res = await request.get(`${API}/health`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe('ok');
});

test('invite → complete → upload → submit → approve', async ({ page, request }) => {
  const hr = { Authorization: 'Bearer dev:hr_admin' };
  const emp = { Authorization: 'Bearer dev:employee' };

  const cases = await request.get(`${API}/api/v1/onboarding/cases`, { headers: hr });
  expect(cases.ok()).toBeTruthy();
  const list = await cases.json();
  const inProgress = list.find((c: { status: string }) => c.status === 'in_progress');
  expect(inProgress).toBeTruthy();

  const detail = await request.get(`${API}/api/v1/onboarding/cases/${inProgress.id}`, { headers: emp });
  const c = await detail.json();
  for (const task of c.tasks.filter((t: { assigneeRole: string }) => t.assigneeRole === 'employee')) {
    if (task.status === 'done') continue;
    if (task.code === 'ID_DOC') {
      const slot = await request.post(`${API}/api/v1/documents`, {
        headers: { ...emp, 'Content-Type': 'application/json' },
        data: {
          caseId: c.id,
          taskId: task.id,
          filename: 'id-card.txt',
          contentType: 'text/plain',
        },
      });
      expect(slot.ok()).toBeTruthy();
      const body = await slot.json();
      const put = await request.put(body.uploadUrl, {
        headers: { 'Content-Type': 'text/plain' },
        data: 'synthetic-id-document',
      });
      expect(put.ok()).toBeTruthy();
    }
    const patched = await request.patch(`${API}/api/v1/onboarding/tasks/${task.id}`, {
      headers: { ...emp, 'Content-Type': 'application/json' },
      data: { status: 'done' },
    });
    expect(patched.ok()).toBeTruthy();
  }

  const submitted = await request.post(`${API}/api/v1/onboarding/cases/${c.id}/submit`, { headers: emp });
  expect(submitted.ok()).toBeTruthy();
  expect((await submitted.json()).status).toBe('pending_hr');

  const approved = await request.post(`${API}/api/v1/onboarding/cases/${c.id}/approve`, { headers: hr });
  expect(approved.ok()).toBeTruthy();
  const approvedBody = await approved.json();
  expect(approvedBody.status).toBe('completed');
  expect(approvedBody.employee.status).toBe('active');

  await page.goto('http://localhost:5173');
  await page.getByTestId('login-dev:hr_admin').click();
  await expect(page.getByRole('heading', { name: 'Onboarding cases' })).toBeVisible();
  await expect(page.getByText('completed').first()).toBeVisible();
});

test('employee portal loads checklist', async ({ page }) => {
  await page.goto('http://localhost:5174');
  await page.getByTestId('dev-login').click();
  await expect(page.getByText('Onboarding portal')).toBeVisible();
});

test('employee cannot list audit', async ({ request }) => {
  const res = await request.get(`${API}/api/v1/audit`, {
    headers: { Authorization: 'Bearer dev:employee' },
  });
  expect(res.status()).toBe(403);
});

test('writes a tiny file for local upload helper', async () => {
  const p = join(tmpdir(), 'hris-e2e.txt');
  writeFileSync(p, 'ok');
  expect(p).toContain('hris-e2e');
});
