import { getObject } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  try {
    const o = await getObject(key.join("/"));
    return new Response(o.Body!.transformToWebStream(), {
      headers: {
        "content-type": o.ContentType || "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
