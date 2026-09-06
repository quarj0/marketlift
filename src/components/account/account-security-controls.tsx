"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { graphqlRequest, resolveApiUrl } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { useLocale } from "@/providers/locale-provider";

export function AccountSecurityControls() {
  const { locale } = useLocale();
  const pt = locale === "pt-BR";
  const { logout } = useAuth();
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const change = useMutation({
    mutationFn: () => graphqlRequest(`mutation ChangePassword($current: String!, $password: String!) { changeMyPassword(currentPassword: $current, newPassword: $password) }`, { current, password }),
    onSuccess: () => { setCurrent(""); setPassword(""); },
  });
  const deactivate = useMutation({
    mutationFn: () => graphqlRequest(`mutation DeactivateAccount { deactivateMyAccount }`),
    onSuccess: async () => { try { await logout(); } finally { router.replace("/"); } },
  });
  return <div className="space-y-6">
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="font-bold">{pt ? "Alterar senha" : "Change password"}</h2>
      <form className="mt-4 grid gap-4" onSubmit={(event) => { event.preventDefault(); change.mutate(); }}>
        <label className="text-sm font-semibold">{pt ? "Senha atual" : "Current password"}<Input className="mt-1" type="password" required autoComplete="current-password" value={current} onChange={(event) => setCurrent(event.target.value)} /></label>
        <label className="text-sm font-semibold">{pt ? "Nova senha" : "New password"}<Input className="mt-1" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {change.isError && <p role="alert" className="text-sm text-rose-700">{change.error.message}</p>}
        {change.isSuccess && <p role="status" className="text-sm text-green-800">{pt ? "Senha atualizada." : "Password updated."}</p>}
        <Button type="submit" disabled={change.isPending}>{pt ? "Atualizar senha" : "Update password"}</Button>
      </form>
    </section>
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="font-bold">{pt ? "Seus dados e sua conta" : "Your data and account"}</h2>
      <p className="mt-2 text-sm text-slate-600">{pt ? "Baixe seu perfil, preferências e atividade. Para solicitar outros dados, correções ou exclusão, fale com o suporte." : "Download your profile, preferences and activity. Contact support to request additional records, corrections or deletion."}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" asChild><a href={resolveApiUrl("/api/v1/auth/activity-export/")}>{pt ? "Baixar minha atividade" : "Download my activity"}</a></Button>
        <Button variant="outline" asChild><Link href="/help/report">{pt ? "Solicitar dados ou exclusão" : "Request data or deletion"}</Link></Button>
      </div>
      <div className="mt-6 border-t pt-5">
        <h3 className="font-semibold">{pt ? "Desativar conta" : "Deactivate account"}</h3>
        <p id="deactivate-description" className="mt-2 text-sm text-slate-600">{pt ? "Você será desconectado, seu acesso será desativado e seus anúncios deixarão de aparecer. Mensagens e registros de suporte serão mantidos. Isso não exclui seus dados. Para reativação, entre em contato com o suporte." : "You will be signed out, account access disabled and your listings hidden. Messages and support records remain. This does not erase your data. Contact support for reactivation."}</p>
        <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} aria-describedby="deactivate-description" className="mt-0.5 size-4 shrink-0" />{pt ? "Entendo e quero desativar minha conta." : "I understand and want to deactivate my account."}</label>
        {deactivate.isError && <p role="alert" className="mt-3 text-sm text-rose-700">{deactivate.error.message}</p>}
        <Button className="mt-4 bg-rose-700 hover:bg-rose-800" disabled={!confirmed || deactivate.isPending} onClick={() => deactivate.mutate()}>{pt ? "Desativar minha conta" : "Deactivate my account"}</Button>
      </div>
    </section>
  </div>;
}
