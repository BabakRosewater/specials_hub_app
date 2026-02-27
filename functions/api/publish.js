export async function onRequest(context) {
  const { request, env } = context;
  if (request.method.toUpperCase() !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const bucket = env.SPECIALS_BUCKET;

  const userEmail =
    request.headers.get("Cf-Access-Authenticated-User-Email") ||
    request.headers.get("cf-access-authenticated-user-email") ||
    "unknown";

  const draftKey = "specials/draft.json";
  const prodKey = "specials/prod.json";

  const draft = await bucket.get(draftKey);
  if (!draft) return json({ ok: false, error: "No draft to publish" }, 404);

  const body = await draft.text();

  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const versionKey = `specials/versions/${stamp}.json`;

  const currentProd = await bucket.get(prodKey);
  if (currentProd) {
    const prodBody = await currentProd.text();
    await bucket.put(versionKey, prodBody, {
      httpMetadata: { contentType: "application/json; charset=utf-8" }
    });
  }

  await bucket.put(prodKey, body, {
    httpMetadata: { contentType: "application/json; charset=utf-8" }
  });

  await bucket.put(
    "specials/_publish_meta.json",
    JSON.stringify(
      {
        publishedAt: new Date().toISOString(),
        publishedBy: userEmail,
        archivedVersion: currentProd ? versionKey : null
      },
      null,
      2
    ),
    { httpMetadata: { contentType: "application/json; charset=utf-8" } }
  );

  return json({ ok: true, publishedBy: userEmail, archivedVersion: currentProd ? versionKey : null });
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
