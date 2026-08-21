import { graphqlRequest } from '@/lib/api-client';
import { mapVerification, type ApiVerification } from '@/lib/api-mappers';

const VERIFICATION_FIELDS = `
  id sellerId sellerName cpfMasked legalName birthDate documentType
  documentFrontUrl documentBackUrl selfieUrl status riskLevel riskFlags
  automatedChecks providerResult submittedAt reviewStartedAt decidedAt decisionNote
`;

export const verificationService = {
  async getStatus() {
    const data = await graphqlRequest<{ mySellerVerification: ApiVerification | null }>(`
      query MySellerVerification {
        mySellerVerification { ${VERIFICATION_FIELDS} }
      }
    `);
    return data.mySellerVerification ? mapVerification(data.mySellerVerification) : null;
  },

  async submit(input: { cpf: string; fullName: string; birthDate: string }) {
    const data = await graphqlRequest<{ submitSellerVerification: ApiVerification }>(`
      mutation SubmitSellerVerification($input: VerificationSubmissionInput!) {
        submitSellerVerification(input: $input) { ${VERIFICATION_FIELDS} }
      }
    `, {
      input: {
        cpf: input.cpf,
        legalName: input.fullName,
        birthDate: input.birthDate,
      },
    });
    return mapVerification(data.submitSellerVerification);
  },
};
