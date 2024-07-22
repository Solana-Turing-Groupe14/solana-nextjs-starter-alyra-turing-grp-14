// MetaPlex TypeScript types, plugins and functions
// prefixes: MPL_
// MPL_F_ - MetaPlex functions
// MPL_P_ - MetaPlex plugins
// MPL_T_ - MetaPlex types
// MPL_C - MetaPlex consts
// MPL_CLS - MetaPlex class


// import {
//   toMetaplexFile as X,
// } from '@metaplex-foundation/mpl-core';


// Create a generic file directly.
// createGenericFile('some content', 'my-file.txt', { contentType: "text/plain" });


import {
  createBrowserFileFromGenericFile as MPL_F_createBrowserFileFromGenericFile,
  createGenericFile as MPL_F_createGenericFile,
  createGenericFileFromBrowserFile as MPL_F_createGenericFileFromBrowserFile,
  createGenericFileFromJson as MPL_F_createGenericFileFromJson,
  parseJsonFromGenericFile as MPL_F_parseJsonFromGenericFile,
} from '@metaplex-foundation/umi';


export {
  MPL_F_createBrowserFileFromGenericFile,
  MPL_F_createGenericFile,
  MPL_F_createGenericFileFromBrowserFile,
  MPL_F_createGenericFileFromJson,
  MPL_F_parseJsonFromGenericFile,
}