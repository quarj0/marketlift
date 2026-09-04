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

  try {
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
  } catch (error) {
    await deleteUpload(prepared.upload.id).catch(() => undefined);
    throw error;
  }
}

export async function deleteUpload(uploadId: string) {
  await apiRequest(`/api/v1/uploads/${uploadId}/`, { method: 'DELETE' });
}

export async function uploadFiles(files: File[], purpose: string) {
  const results = await Promise.allSettled(
    files.map((file) => uploadFile(file, purpose)),
  );
  const uploadIds = results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );
  const failure = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );
  if (failure) {
    await Promise.allSettled(uploadIds.map(deleteUpload));
    throw failure.reason;
  }
  return uploadIds;
}
