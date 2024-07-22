
if (!process.env.NEXT_PUBLIC_STORAGE_RPC_URL) {
    throw new Error("NEXT_PUBLIC_STORAGE_RPC_URL is required");
}
// console.log('STORAGE_RPC_URL', process.env.STORAGE_RPC_URL);

export const PUBLIC_STORAGE_RPC_URL = process.env.NEXT_PUBLIC_STORAGE_RPC_URL||"";
if (!PUBLIC_STORAGE_RPC_URL) {
  throw new Error('NEXT_PUBLIC_STORAGE_RPC_URL not found')
}
