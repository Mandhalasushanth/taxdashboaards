/**
 * DEVELOPMENT ONLY. The demo backend has no file storage, so seeded documents get a generated preview
 * image that is clearly labelled as a sample. Files uploaded during the session are kept as in-memory
 * object URLs so "View" shows the real file. Loaded only through the dev-guarded demo store.
 */
const uploadedFiles = new Map<string, string>();

const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);

/** A simple A4-proportioned page naming the document, the customer and who uploaded it. */
export function samplePreviewUrl(label: string, customer: string, uploadedBy: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">
<rect width="595" height="842" fill="#FFFFFF"/>
<rect x="0" y="0" width="595" height="96" fill="#083B75"/>
<text x="40" y="58" font-family="Segoe UI, Arial" font-size="26" font-weight="700" fill="#FFFFFF">${escapeXml(label)}</text>
<text x="40" y="150" font-family="Segoe UI, Arial" font-size="16" fill="#64748B">Customer</text>
<text x="40" y="176" font-family="Segoe UI, Arial" font-size="20" font-weight="600" fill="#172033">${escapeXml(customer)}</text>
<text x="40" y="226" font-family="Segoe UI, Arial" font-size="16" fill="#64748B">Uploaded by</text>
<text x="40" y="252" font-family="Segoe UI, Arial" font-size="20" font-weight="600" fill="#172033">${escapeXml(uploadedBy)}</text>
<rect x="40" y="300" width="515" height="420" rx="8" fill="#F7F9FC" stroke="#E2E8F0"/>
<text x="297" y="500" text-anchor="middle" font-family="Segoe UI, Arial" font-size="18" fill="#94A3B8">Sample preview (demo data)</text>
<text x="297" y="528" text-anchor="middle" font-family="Segoe UI, Arial" font-size="14" fill="#94A3B8">The real file appears here once it is stored on the server</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function rememberUploadedFile(documentId: string, file: File): void {
  const previous = uploadedFiles.get(documentId);
  if (previous) URL.revokeObjectURL(previous);
  uploadedFiles.set(documentId, URL.createObjectURL(file));
}

export function uploadedFileUrl(documentId: string): string | undefined {
  return uploadedFiles.get(documentId);
}
