export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  const bucket = env.SPECIALS_BUCKET;
  const which = (url.searchParams.get("env") || "prod").toLowerCase();
  const key = which === "draft" ? "specials/draft.json" : "specials/prod.json";

  const userEmail =
    request.headers.get("Cf-Access-Authenticated-User-Email") ||
    request.headers.get("cf-access-authenticated-user-email") ||
    "unknown";

  if (method === "GET") {
    const obj = await bucket.get(key);
    if (!obj) {
      return json({ ok: false, error: `Missing ${key}` }, 404);
    }

    const body = await obj.text();
    return new Response(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
        "X-Specials-Env": which
      }
    });
  }

  if (method === "PUT") {
    if (which !== "draft") {
      return json({ ok: false, error: "Only draft is writable" }, 403);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON body" }, 400);
    }

    const errors = validateSpecials(payload);
    if (errors.length) {
      return json({ ok: false, error: "Validation failed", errors }, 400);
    }

    const pretty = JSON.stringify(payload, null, 2);
    await bucket.put(key, pretty, {
      httpMetadata: { contentType: "application/json; charset=utf-8" }
    });

    await bucket.put(
      "specials/_draft_meta.json",
      JSON.stringify(
        {
          savedAt: new Date().toISOString(),
          savedBy: userEmail
        },
        null,
        2
      ),
      { httpMetadata: { contentType: "application/json; charset=utf-8" } }
    );

    return json({ ok: true, env: "draft", savedBy: userEmail });
  }

  return json({ ok: false, error: "Method not allowed" }, 405);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}

function validateSpecials(data) {
  const errs = [];

  if (!data || typeof data !== "object") errs.push("Top-level must be an object.");
  if (!data.meta || typeof data.meta !== "object") errs.push("meta is required.");
  if (!Array.isArray(data.navCards)) errs.push("navCards must be an array.");
  if (!Array.isArray(data.sections)) errs.push("sections must be an array.");
  if (!data.footer || typeof data.footer !== "object") errs.push("footer is required.");

  const allowedTypes = new Set(["finance", "leaseGrid", "purchaseGrid", "serviceCoupons", "ctaSplit"]);
  if (Array.isArray(data.sections)) {
    data.sections.forEach((s, i) => {
      if (!s || typeof s !== "object") return errs.push(`sections[${i}] must be an object.`);
      if (!s.id && s.type !== "ctaSplit") errs.push(`sections[${i}].id is required.`);
      if (!s.type) errs.push(`sections[${i}].type is required.`);
      if (s.type && !allowedTypes.has(s.type)) errs.push(`sections[${i}].type "${s.type}" is not supported.`);
    });
  }

  return errs;
}
