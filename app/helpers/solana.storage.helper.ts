
if (!process.env.STORAGE_RPC_URL) {
    throw new Error("NEXT_PUBLIC_RPC_URL is required");
}
// console.log('STORAGE_RPC_URL', process.env.STORAGE_RPC_URL);

export const STORAGE_RPC_URL = process.env.STORAGE_RPC_URL;
if (STORAGE_RPC_URL === undefined) {
  throw new Error('STORAGE_RPC_URL not found')
}
