import { d as defineEventHandler, g as getRequestIP, c as createError, r as readBody, s as sanitize, v as validateBody, U as User, a as getAuthSession, u as userLoginSchema } from '../../../nitro/nitro.mjs';
import bcrypt from 'bcryptjs';
import 'mongoose';
import 'yup';
import 'cloudinary';
import 'square';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'consola';
import 'consola/utils';
import 'vue';
import 'node:url';
import '@iconify/utils';
import 'fast-xml-parser';
import 'ipx';

const loginAttempts = /* @__PURE__ */ new Map();
const login_post = defineEventHandler(async (event) => {
  const ip = getRequestIP(event) || "unknown";
  const now = Date.now();
  const existing = loginAttempts.get(ip);
  if (existing && now >= existing.resetAt) {
    loginAttempts.delete(ip);
  }
  const attempts = loginAttempts.get(ip);
  if (attempts && attempts.count >= 5) {
    throw createError({
      status: 429,
      statusText: "Too many login attempts. Try again in 15 minutes."
    });
  }
  const body = await readBody(event);
  const sanitized = sanitize(body);
  const validated = await validateBody(sanitized, userLoginSchema);
  const users = await User.find({ email: validated.email });
  if (users.length === 0) {
    const current = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1e3 };
    current.count++;
    loginAttempts.set(ip, current);
    console.warn(`[AUTH] Failed login for ${validated.email} from ${ip} (unknown user)`);
    throw createError({ status: 401, statusText: "Invalid credentials" });
  }
  const user = users[0];
  const userObj = user.toObject();
  const storedPassword = userObj.password;
  const isBcryptHash = /^\$2[aby]\$/.test(storedPassword);
  let isMatch = false;
  if (isBcryptHash) {
    isMatch = await bcrypt.compare(validated.password, storedPassword);
  } else {
    isMatch = validated.password === storedPassword;
    if (isMatch) {
      const hashed = await bcrypt.hash(validated.password, 10);
      await User.updateOne({ _id: user._id }, { password: hashed });
    }
  }
  if (!isMatch) {
    const current = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1e3 };
    current.count++;
    loginAttempts.set(ip, current);
    console.warn(`[AUTH] Failed login for ${validated.email} from ${ip}`);
    throw createError({ status: 401, statusText: "Invalid credentials" });
  }
  loginAttempts.delete(ip);
  const session = await getAuthSession(event);
  await session.clear();
  const newSession = await getAuthSession(event);
  await newSession.update({ userId: userObj._id.toString(), email: userObj.email });
  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
