/** Awaits a store mutation and shows its error message, if any. */
export async function run(op: Promise<string | null>): Promise<void> {
  const error = await op;
  if (error && typeof window !== "undefined") window.alert(error);
}
