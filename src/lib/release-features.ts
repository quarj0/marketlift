function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

export const releaseFeatures = Object.freeze({
  payments: enabled(process.env.NEXT_PUBLIC_MARKETLIFT_PAYMENTS_ENABLED),
  cpfVerification: enabled(
    process.env.NEXT_PUBLIC_MARKETLIFT_CPF_VERIFICATION_ENABLED,
  ),
});
