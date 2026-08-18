import type { VerificationSubmission } from "@/types";
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
let submission: VerificationSubmission | undefined;
const mask = (cpf: string) => `***.***.***-${cpf.replace(/\D/g, "").slice(-2)}`;
export const verificationService = {
  async getStatus() {
    await delay(220);
    return submission ?? null;
  },
  async submit(input: { cpf: string; fullName: string; birthDate: string }) {
    await delay(550);
    submission = {
      id: `ver-${Date.now()}`,
      cpfMasked: mask(input.cpf),
      fullName: input.fullName,
      birthDate: input.birthDate,
      status: "pending",
      submittedAt: new Date().toISOString(),
      providerResult: "Identity checks queued",
      riskFlags: [],
    };
    return submission;
  },
  async simulateResult(result: "verified" | "rejected") {
    await delay(800);
    if (!submission) throw new Error("No verification");
    submission.status = result;
    submission.providerResult =
      result === "verified"
        ? "Identity matched successfully"
        : "Identity information could not be confirmed";
    submission.riskFlags =
      result === "rejected" ? ["Identity data mismatch"] : [];
    return submission;
  },
};
