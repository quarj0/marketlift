import {
  API_BASE_URL,
  apiRequest,
  ensureCsrfToken,
  resolveApiUrl,
} from '@/lib/api-client';

type PreparedUpload = {
  upload: { id: string };
  target: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    fields?: Record<string, string>;
  };
};

function sameApiOrigin(url: string) {
  try {
    return new URL(resolveApiUrl(url)).origin === new URL(API_BASE_URL).origin;
  } catch {
    return false;
  }
}

export async function uploadFile(file: File, purpose: string) {
  const prepared = await apiRequest<PreparedUpload>('/api/v1/uploads/prepare/', {
    method: 'POST',
    json: {
      purpose,
      name: file.name,
      mimeType: file.type,
      size: file.size,
    },
  });

  const targetUrl = resolveApiUrl(prepared.target.url);
  const headers = new Headers(prepared.target.headers || {});
  let body: BodyInit = file;

  if (sameApiOrigin(targetUrl)) {
    const csrf = await ensureCsrfToken();
    if (csrf) headers.set('X-CSRFToken', csrf);
  }

  if (prepared.target.fields && Object.keys(prepared.target.fields).length > 0) {
    const form = new FormData();
    Object.entries(prepared.target.fields).forEach(([key, value]) => form.append(key, value));
    form.append('file', file);
    body = form;
    headers.delete('Content-Type');
  }

  const response = await fetch(targetUrl, {
    method: prepared.target.method || 'PUT',
    headers,
    body,
    credentials: sameApiOrigin(targetUrl) ? 'include' : 'omit',
  });
  if (!response.ok) throw new Error('File upload failed.');

  await apiRequest(`/api/v1/uploads/${prepared.upload.id}/complete/`, {
    method: 'POST',
    json: {},
  });

  return prepared.upload.id;
}
