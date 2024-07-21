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

// --------------------------------------------------

// Storage

// Create a generic file directly.
// createGenericFile('some content', 'my-file.txt', { contentType: "text/plain" });
/*
export const testUpload = async (content: string, filename: string, contentType: string): Promise<string> => {
  const LOGPREFIX = `${filePath}:testUpload: `
  console.debug(`${LOGPREFIX}()`)
  // const res = await mplx_umi_storage.upload(content, filename, { contentType })

  // Create a generic file directly.
  createGenericFile('some content', 'my-file.txt', { contentType: "text/plain" });

  // Parse a generic file to and from a browser file.
  await createGenericFileFromBrowserFile(myBrowserFile);
  createBrowserFileFromGenericFile(myGenericFile);
  
  // Parse a generic file to and from a JSON object.
  createGenericFileFromJson(myJson);
  parseJsonFromGenericFile(myGenericFile);

  // console.debug(`${LOGPREFIX}res:`, res)
  // return res
    return ""
} // testUpload
*/
// --------------------------------------------------