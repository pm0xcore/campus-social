import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jose before importing auth
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => vi.fn()),
  jwtVerify: vi.fn(),
}));

import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { jwtVerify } from 'jose';

describe('withAuth middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no authorization header', async () => {
    const handler = vi.fn();
    const wrappedHandler = withAuth(handler);

    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
    });

    const response = await wrappedHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Missing or invalid Authorization header');
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header is not Bearer', async () => {
    const handler = vi.fn();
    const wrappedHandler = withAuth(handler);

    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
      headers: {
        Authorization: 'Basic abc123',
      },
    });

    const response = await wrappedHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Missing or invalid Authorization header');
  });

  it('calls handler with auth state when token is valid', async () => {
    const mockPayload = {
      edu_username: 'testuser.edu',
      eth_address: '0x123',
    };

    vi.mocked(jwtVerify).mockResolvedValueOnce({
      payload: mockPayload,
      protectedHeader: { alg: 'RS256' },
    });

    const handler = vi.fn().mockResolvedValue(new Response('OK'));
    const wrappedHandler = withAuth(handler);

    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    });

    await wrappedHandler(request);

    expect(handler).toHaveBeenCalledWith(
      request,
      { OCId: 'testuser.edu', ethAddress: '0x123' },
      undefined
    );
  });

  it('returns 401 when token is invalid', async () => {
    vi.mocked(jwtVerify).mockRejectedValueOnce(new Error('Invalid token'));

    const handler = vi.fn();
    const wrappedHandler = withAuth(handler);

    const request = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    const response = await wrappedHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Invalid or expired token');
    expect(handler).not.toHaveBeenCalled();
  });
});
