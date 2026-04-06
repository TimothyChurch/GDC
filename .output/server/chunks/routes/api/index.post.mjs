import { d as defineEventHandler, ag as getCloudinary, ah as readMultipartFormData, c as createError } from '../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  var _a;
  const cloudinary = getCloudinary(event);
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ status: 400, statusText: "No file uploaded" });
  }
  const file = formData.find((f) => f.name === "file");
  if (!file || !file.data) {
    throw createError({ status: 400, statusText: "No file field found" });
  }
  const folderField = formData.find((f) => f.name === "folder");
  const folder = ((_a = folderField == null ? void 0 : folderField.data) == null ? void 0 : _a.toString()) || "gdc";
  const maxSize = 10 * 1024 * 1024;
  if (file.data.length > maxSize) {
    throw createError({ status: 400, statusText: "File exceeds 10MB limit" });
  }
  const mime = file.type || "";
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  if (!allowedTypes.includes(mime)) {
    throw createError({ status: 400, statusText: "File type not allowed. Use JPEG, PNG, WebP, GIF, or PDF." });
  }
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `gdc/${folder}`,
          resource_type: "auto"
        },
        (error, result2) => {
          if (error) reject(error);
          else resolve(result2);
        }
      ).end(file.data);
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch {
    throw createError({ status: 500, statusText: "Upload failed" });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
