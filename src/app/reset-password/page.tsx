import { ResetPasswordClient } from './reset-password-client';

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const rawToken = params.token;
  const raw = Array.isArray(rawToken) ? rawToken[0] ?? '' : rawToken ?? '';
  let token = raw.replace(/\s+/g, '').replace(/^=+/, '');
  // Some development mail viewers expose quoted-printable '=3D' as a literal
  // '3D' prefix when a raw message link is copied. A reset token is a
  // base64-encoded UUID followed by a dot, so this prefix is unambiguous.
  if (/^3D(?=[A-Za-z0-9_-]+\.)/.test(token)) token = token.slice(2);

  return <ResetPasswordClient token={token} />;
}
