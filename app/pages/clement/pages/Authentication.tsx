import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { getWalletAuthentication, verifyEncodedMessage } from "@helpers/solana.helper";

export default function Authentication() {

    const wallet = useWallet();

    const authMessage = 'Alyra connection';
    const fakeAuthMessage = 'Alyra connection fake message';
    const [encodedMessage, setEncodedMessage] = useState<Uint8Array | null>(null);
    const [canDecodeMessage, setCanDecodeMessage] = useState<boolean | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h1>
                Authentication
            </h1>
            {
                !encodedMessage && (
                    <button className="buttonClementSignOk"
                        style={{ width: '200px' }}
                        onClick={async () => {
                            const signedMessage = await getWalletAuthentication(wallet, authMessage);
                            setEncodedMessage(signedMessage);
                        }}
                    >
                        Sign Message
                    </button>
                )
            }
                        {
                !encodedMessage && (
                    <button className="buttonClementSignKo"
                        style={{ width: '200px' }}
                        onClick={async () => {
                            const signedMessage = await getWalletAuthentication(wallet, fakeAuthMessage);
                            setEncodedMessage(signedMessage);
                        }}
                    >
                        Sign Fake Message
                    </button>
                )
            }
            {
                encodedMessage && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                        <p className="">
                            Signed message:
                        </p>
                        <p className="clementSmallP">
                            {encodedMessage}
                        </p>
                        <button className="buttonClementDecode"
                            style={{ width: '200px' }}
                            onClick={async () => {
                                const isVerified = await verifyEncodedMessage(wallet, authMessage, encodedMessage);
                                setCanDecodeMessage(isVerified);
                            }}
                        >
                            Decode
                        </button>
                    </div>
                )
            }
            {
                canDecodeMessage !== null && (
                    <div>
                        Can decode message: <b>
                        {canDecodeMessage ?
                            <p className="clementOkP">YES</p>
                            :
                            <p className="clementKoP">NO</p>
                        }</b>
                    </div>
                )
            }
            {
                encodedMessage && (
                    <button
                        style={{ width: '200px' }}
                        onClick={() => {
                            setEncodedMessage(null);
                            setCanDecodeMessage(null);
                        }}
                    >
                        Reset
                    </button>
                )
            }
        </div>
    );
}