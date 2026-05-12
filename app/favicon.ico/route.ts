const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#2563eb"/>
  <path fill="#fff" d="M18 28h28v22H18z"/>
  <path fill="#facc15" d="M14 22h36v10H14z"/>
  <path fill="#fff" d="M28 14h8v36h-8z"/>
  <path fill="#ef4444" d="M24 17c-5-6-14 1-8 8 4 5 12 5 16 5-1-4-3-9-8-13Zm16 0c5-6 14 1 8 8-4 5-12 5-16 5 1-4 3-9 8-13Z"/>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
