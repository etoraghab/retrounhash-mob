import { db } from "$lib/gun";
import { checkVerification } from "$lib/utils";

export const ssr = false;
export const csr = true;

export async function load({ params }) {
  return await checkVerification(db.user()._.sea.pub);
}
