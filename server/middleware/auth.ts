export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const path = url.pathname;
  const method = event.method;

  // Only protect /api/ routes
  if (!path.startsWith("/api/")) {
    return;
  }

  // Public API routes that don't require authentication
  const publicRoutes = [
    { path: "/api/users/find", method: "PUT" }, // Login
    { path: "/api/contact/create", method: "POST" }, // Contact form
    { path: "/api/stripe", method: "*" }, // Stripe payment
  ];

  // Public GET-only routes (for public-facing pages)
  const publicGetRoutes = ["/api/cocktail", "/api/bottle", "/api/item"];

  // Check if this is a public route
  for (const route of publicRoutes) {
    if (
      path.startsWith(route.path) &&
      (route.method === "*" || method === route.method)
    ) {
      return;
    }
  }

  // Allow GET requests on public routes
  if (method === "GET") {
    for (const route of publicGetRoutes) {
      if (path.startsWith(route)) {
        return;
      }
    }
  }

  // All other API routes require authentication
  const userCookie = getCookie(event, "user");
  if (!userCookie) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    if (!user.authenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }
  } catch (e) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
});
