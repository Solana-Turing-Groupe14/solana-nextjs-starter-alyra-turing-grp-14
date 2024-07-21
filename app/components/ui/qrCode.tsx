import { Box, useMediaQuery } from "@chakra-ui/react";
import { QRCode } from "react-qrcode-logo";
import { I_QrCode } from "types";

export const QrCode = ({ text, id }:I_QrCode) => {

  const [isSmall] = useMediaQuery("(max-width: 768px)")
  const [isMediuml] = useMediaQuery("(max-width: 1280px)")

  return (
    <div>
      <Box
        className='mt-3 flex p-1 justify-center'
        border={'none '}
        borderRadius={'md'}
        display={ (id && text.length ? 'flex' : 'none') }
      >
        <QRCode
          value={text}
          id={id}
          size={isSmall? 192 : (isMediuml?512:1024)}
          bgColor={'white'}
          fgColor={'black'}
          quietZone={4}
          ecLevel={'Q'} // error correction : L, M, Q, H (default is 'M', the bigger the logo, the higher the error correction level)
          logoImage={'/favicon-96x96.png'}
          removeQrCodeBehindLogo={true}
        />
      </Box>
    </div>
  );
};