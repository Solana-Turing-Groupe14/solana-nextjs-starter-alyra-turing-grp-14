export default async function handler(req, res) {
//   const { id } = req.query;
//   const signer = await getSigner(id);
//   res.status(200).json(signer);

  const { name } = req.query;
  console.debug('get-signer: name', name)

  const TEST_SIGNER_SEED_text = process.env.TEST_SIGNER_SEED || ''
  console.debug('get-signer: TEST_SIGNER_SEED', TEST_SIGNER_SEED_text)

  const jsonString = Buffer.from(TEST_SIGNER_SEED_text).toString('utf8')
  console.log(`signers_consts: jsonString = ${jsonString}`)

  const parsedData = JSON.parse(jsonString)

  // const someRandomSecretKey_ = [40,  93,  83,  37,  31,  65,  52,  11,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19]

  console.log(parsedData)
  // export const TEST_SIGNER_SEED = new Uint8Array(
  //   someRandomSecretKey_
  // )

  res.status(200).json(parsedData);

}