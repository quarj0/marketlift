import { sellers } from "@/mocks/data";
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms));
export const sellerService = {
  async getSeller(id: string) {
    await delay();
    return sellers.find((s) => s.id === id) ?? null;
  },
  async getSellers() {
    await delay();
    return sellers;
  },
  async getVerified(limit = 6) {
    await delay();
    return sellers.filter((s) => s.verified).slice(0, limit);
  },
};
