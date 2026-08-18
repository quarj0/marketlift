import { connection } from "next/server";
import { EditListingClient } from "./edit-listing-client";

export default async function EditListingPage() {
  await connection();

  return <EditListingClient />;
}
