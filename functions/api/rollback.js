export async function onRequest(context) {
  const { request, env } = context;
  if (request.method.toUpperCase() !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const bucket = env.SPECIALS_BUCKET;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const key = body?.versionKey;
  if (!key || !String(key).startsWith("specials/versions/")) {
    return json({ ok: false, error: "versionKey is required and must be under specials/versions/" }, 400);
  }

  const versionObj = await bucket.get(key);
  if (!versionObj) return json({ ok: false, error: "Version not found" }, 404);

  const versionText = await versionObj.text();
  await bucket.put("specials/prod.json", versionText, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  return json({ ok: true, rolledBackTo: key });
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
