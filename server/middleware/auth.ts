export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const path = url.pathname;
  const method = event.method;

  // Only protect /api/ routes
  if (!path.startsWith('/api/')) {
    return;
  }

  // Public API routes that don't require authentication
  const publicRoutes = [
    { path: '/api/auth/login', method: 'POST' },
    { path: '/api/auth/logout', method: 'POST' },
    { path: '/api/contact/create', method: 'POST' },
    { path: '/api/subscribers/create', method: 'POST' },
    { path: '/api/stripe', method: '*' },
  ];

  // Public GET-only routes (for public-facing pages)
  const publicGetRoutes = ['/api/cocktail', '/api/bottle', '/api/item', '/api/auth/me'];

  // Check if this is a public route
  for (const route of publicRoutes) {
    if (
      path.startsWith(route.path) &&
      (route.method === '*' || method === route.method)
    ) {
      return;
    }
  }

  // Allow GET requests on public routes
  if (method === 'GET') {
    for (const route of publicGetRoutes) {
      if (path.startsWith(route)) {
        return;
      }
    }
  }

  // All other API routes require a valid session
  const session = await getAuthSession(event);
  if (!session.data.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
});
