import { error } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return params;

  throw error(404, "Not found");
}
export const ssr = false;
export const csr = true;
