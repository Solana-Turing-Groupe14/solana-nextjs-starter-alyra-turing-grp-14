export default async function handler(req, res) {
//   const { id } = req.query;
//   const signer = await getSigner(id);
//   res.status(200).json(signer);

  const { name } = req.query;
  console.debug('get-signer: name', name)

  let SIGNER_SEED_TEXT_from_env

  if (!name) {
    SIGNER_SEED_TEXT_from_env = process.env.DEFAULT_SIGNER_SEED || ''
  } else {
    SIGNER_SEED_TEXT_from_env = process.env[name] || ''
  }

  if (!SIGNER_SEED_TEXT_from_env) {
    res.status(404).send('Not Found')
  }
/*
  switch (name) {
    case 'TEST_SIGNER':
      SIGNER_SEED_TEXT_from_env = process.env[name] || ''
      break;
    default:
      SIGNER_SEED_TEXT_from_env = process.env.DEFAULT_SIGNER_SEED || ''
      break;

      // default:
      //   SIGNER_SEED_TEXT_from_env = process.env.TEST_SIGNER_SEED || ''
      //   break;

    // default:
    //   res.status(404).send('Not Found')
  }
*/
  // console.debug('get-signer: SIGNER_SEED_TEXT_from_env', SIGNER_SEED_TEXT_from_env)

  const jsonString = Buffer.from(SIGNER_SEED_TEXT_from_env).toString('utf8')
  // console.log(`signers_consts: jsonString = ${jsonString}`)
  const parsedData = JSON.parse(jsonString)

  // const someRandomSecretKey_ = [40,  93,  83,  37,  31,  65,  52,  11,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19]

  // console.log(parsedData)
  // export const TEST_SIGNER_SEED = new Uint8Array(
  //   someRandomSecretKey_
  // )

  res.status(200).json(parsedData);

}