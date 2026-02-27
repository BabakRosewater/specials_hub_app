export async function onRequest(context) {
  const { request, env } = context;
  if (request.method.toUpperCase() !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const bucket = env.SPECIALS_BUCKET;
  const listed = await bucket.list({ prefix: "specials/versions/" });

  const items = listed.objects
    .map((o) => ({ key: o.key, uploaded: o.uploaded }))
    .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

  return new Response(JSON.stringify({ ok: true, versions: items }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
