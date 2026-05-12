import { buildApp } from "@/src/app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "OPTIONS";

let appPromise: ReturnType<typeof buildApp> | undefined;

function getApp() {
  appPromise ??= buildApp();
  return appPromise;
}

async function handleRequest(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  try {
    const app = await getApp();
    const { path = [] } = await params;
    const url = new URL(request.url);
    const apiPath = `/api/${path.join("/")}${url.search}`;
    const headers = Object.fromEntries(request.headers.entries());
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : Buffer.from(await request.arrayBuffer());

    const response = await app.inject({
      method: request.method as HttpMethod,
      url: apiPath,
      headers,
      payload: body
    });

    const responseHeaders = new Headers();
    for (const [key, value] of Object.entries(response.headers)) {
      if (typeof value === "string") {
        responseHeaders.set(key, value);
      }
    }

    return new Response(response.body, {
      status: response.statusCode,
      headers: responseHeaders
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: {
          code: "API_BOOT_ERROR",
          message: error instanceof Error ? error.message : "Unable to start API route"
        }
      },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
