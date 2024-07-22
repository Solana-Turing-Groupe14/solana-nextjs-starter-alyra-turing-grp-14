import { BN } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { getAccount, /* getInitializeAccountTransactionWWithoutAnchor, */ initializeAccount } from "@helpers/solana.helper";

export default function Account() {

    const anchorWallet = useAnchorWallet();
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [sendingTransaction, setSendingTransaction] = useState<boolean>(false);
    const [rawData, setRawData] = useState<number>(123456);
    const [age, setAge] = useState<number>(33);
    const [taille, setTaille] = useState(0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h1>
                Account
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>
                    <label className="labelClement">
                        Data
                    </label>
                    <input
                        type="number"
                        value={rawData}
                        onChange={(e) => setRawData(parseInt(e.target.value))}
                        placeholder="Data"
                    />
                </div>
                <div>
                    <label className="labelClement">
                        Age
                    </label>
                    <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value))}
                        placeholder="Age"
                    />
                </div>
                <div className="bg-slate-400">
                    <label className="labelClement">
                        taille
                    </label>
                    <input
                        type="number"
                        value={taille}
                        onChange={(e) => setTaille(parseInt(e.target.value))}
                        placeholder="Taille"
                    />
                </div>
            </div>
            {
                anchorWallet?.publicKey && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button className="buttonClementInfo"
                            onClick={async () => {
                                if (anchorWallet.publicKey) {
                                    // const account = await getAccount(anchorWallet.publicKey)
                                    const account = await getAccount(anchorWallet.publicKey)
                                    if (!account) {
                                        console.warn('Account not found');
                                        alert('Account not found')
                                    }
                                    // setAccount(account);
                                    // account?.rawData && setRawData(account.rawData);
                                    // console.debug('account', account)
                                    // debugger
                                    if (account?.rawData) {
                                        console.debug('rawData', account.rawData)
                                    }
                                    // const rawData = new BN(account.rawData)
                                    // console.debug('rawData', rawData.toNumber())
                                    account?.rawData && setRawData( new BN(account.rawData).toNumber() );
                                    account?.age && setAge(account.age);
                                    account?.taille && setTaille(account.taille);
                                }
                            }}
                        >
                            Get Account
                        </button>
                        <button className="buttonClementAction"
                            onClick={async () => {
                                if (anchorWallet.publicKey) {
                                    setSendingTransaction(true);
                                    // const initResult = await initializeAccount(anchorWallet, rawData | 1, age | 20);
                                    // console.debug('onClick Create Account Anchor')
                                    const initResult = await initializeAccount(anchorWallet, rawData || 1, age || 20, taille || 160);
                                    setTransactionHash(initResult);
                                    setSendingTransaction(false);
                                }
                            }}
                        >
                            Create Account Anchor
                        </button>
                        <button className="buttonClementActionDisabled" disabled={true}

                            // onClick={async () => {
                            //     if (anchorWallet.publicKey) {
                            //         setSendingTransaction(true);
                            //         // const initResult = await initializeAccount(anchorWallet, rawData | 1, age | 20);
                            //         console.debug('onClick Create Account')
                            //         const initResult = await getInitializeAccountTransactionWWithoutAnchor( rawData | 1, age | 20, taille | 160);
                            //         setTransactionHash(initResult);
                            //         setSendingTransaction(false);
                            //     }
                            // }}
                        >
                            Create Account 
                        </button>

                    </div>
                )
            }
            {/* {
                account  && (
                    <p>
                        Account: <b>{account === null ? 'N/A' : `rawData: ${account.rawData} ; age: ${account.age}`}</b>
                    </p>
                )
            } */}
            {
                sendingTransaction && (
                    <p>
                        Sending transaction...
                    </p>
                )
            }
            {
                transactionHash && !sendingTransaction && (
                    <p className="clementSmallP">
                        Transaction hash: <b>{transactionHash}</b>
                    </p>
                )
            }
        </div>
    );
}