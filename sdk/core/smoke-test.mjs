import http from 'http';
import { IdentityClient } from './dist/index.js';

let refreshCount = 0;
let protectedCallCount = 0;

const server = http.createServer((req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    const parsed = body ? JSON.parse(body) : {};

    res.setHeader('Content-Type', 'application/json');

    // LOGIN
    if (req.url === '/api/v1/auth/login') {
      return res.end(
        JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'Logged in',
          data: {
            user: {
              id: '1',
              username: 'jane',
              email: 'jane@example.com',
              createdAt: new Date().toISOString(),
            },
            accessToken: 'access-1',
            refreshToken: 'refresh-1',
          },
          timestamp: new Date().toISOString(),
        }),
      );
    }

    // REFRESH
    if (req.url === '/api/v1/auth/refresh') {
      refreshCount++;

      if (parsed.refreshToken !== 'refresh-1') {
        res.statusCode = 401;

        return res.end(
          JSON.stringify({
            success: false,
            statusCode: 401,
            message: 'Invalid refresh token',
            timestamp: new Date().toISOString(),
          }),
        );
      }

      return res.end(
        JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'Refreshed',
          data: {
            accessToken: 'access-2',
            refreshToken: 'refresh-2',
          },
          timestamp: new Date().toISOString(),
        }),
      );
    }

    // PROTECTED ENDPOINT
    if (req.url === '/api/v1/sessions') {
      protectedCallCount++;

      const auth = req.headers.authorization;

      if (auth !== 'Bearer access-2') {
        res.statusCode = 401;

        return res.end(
          JSON.stringify({
            success: false,
            statusCode: 401,
            message: 'Expired access token',
            timestamp: new Date().toISOString(),
          }),
        );
      }

      return res.end(
        JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'Success',
          data: [
            {
              id: 'session-1',
              deviceName: 'Chrome on Ubuntu',
              isCurrent: true,
              createdAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            },
          ],
          timestamp: new Date().toISOString(),
        }),
      );
    }

    res.statusCode = 404;

    res.end(
      JSON.stringify({
        success: false,
        statusCode: 404,
        message: 'Not Found',
        timestamp: new Date().toISOString(),
      }),
    );
  });
});

server.listen(0, async () => {
  const port = server.address().port;

  const client = new IdentityClient({
    baseUrl: `http://localhost:${port}/api/v1`,
  });

  const tokenChanges = [];

  client.onTokensChanged((tokens) => {
    tokenChanges.push(tokens);
  });

  // Login
  const user = await client.auth.login({
    username: 'jane',
    password: 'password123',
  });

  console.log('Logged in as:', user.username);

  // Simulate expired token
  client.setTokens({
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
  });

  // Protected endpoint (should refresh automatically)
  const sessions = await client.sessions.list();

  console.log('Sessions:', sessions);

  console.log('Refresh Count:', refreshCount);
  console.log('Protected Calls:', protectedCallCount);
  console.log('Current Tokens:', client.getTokens());
  console.log('Token Events:', tokenChanges.length);

  if (
    refreshCount === 1 &&
    protectedCallCount === 2 &&
    client.getTokens().accessToken === 'access-2'
  ) {
    console.log('\n✅ SMOKE TEST PASSED');
  } else {
    console.log('\n❌ SMOKE TEST FAILED');
    process.exitCode = 1;
  }

  server.close();
});
