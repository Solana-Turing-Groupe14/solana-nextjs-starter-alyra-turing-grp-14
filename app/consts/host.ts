const filePath = "app/consts/host.ts"

// --------------------------------------------------

const HOST = process.env.NEXT_PUBLIC_HOST||""
if (!HOST) {
  throw new Error(`${filePath}:NEXT_PUBLIC_HOST not found`)
}

const PORT = process.env.NEXT_PUBLIC_PORT||""


export {
  HOST,
  PORT,
}
