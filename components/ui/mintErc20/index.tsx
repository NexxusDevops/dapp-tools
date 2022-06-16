import React, { useContext, useState } from 'react';
import { ERC20Data } from '../../../pages/api/erc20';
import { WalletContext } from '../../../pages/_app';
import { deployContract } from '../../../utils/contract_deployer';
import { ERCs } from '../../../utils/types';
import { Button, CheckboxInput, TextInput, TextInputTypes } from '../generalComponents';
import DropdownInput from '../generalComponents/DropdownInput';
import networksData from '../../../data/networks.json';
import path from 'path';

const MintErc20 = () => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [burnable, setBurnable] = useState(false);
    const [snapshots, setSnapshots] = useState(false);
    const [pausable, setPausable] = useState(false);
    const [premint, setPremint] = useState('');
    const [mintable, setMintable] = useState(false);
    const [permit, setPermit] = useState(false);
    const [votes, setVotes] = useState(false);
    const [flashmint, setFlashmint] = useState(false);
    const [access, setAccess] = useState('ownable');
    const [upgradeable, setUpgradeable] = useState('false');
    const [securityContract, setSecurityContract] = useState('');
    const [license, setLicense] = useState('');
    const [networkName, setNetworkName] = useState('');

    const [afterDeploymentDesc, setAfterDeploymentDesc] = useState('');

    const [step1Open, setStep1Open] = useState(true);
    const [step2Open, setStep2Open] = useState(false);

    const walletContext = useContext(WalletContext);
    walletContext.web3Provider?.getNetwork().then((v) => {
        setNetworkName(v.name);
    });

    // useEffect(() => {
    //     walletContext.web3Provider?.getNetwork().then((v) => {
    //         console.log(v);
    //         setNetwork(v.name);
    //     });
    // }, []);

    const handleStep1Submit = async () => {
        console.log('Clicked Mint');

        if (!name || !symbol || !premint || !access || !upgradeable || !securityContract || !license) {
            return;
        }

        if (Number.parseInt(premint) < 1) {
            return;
        }

        if (!(access == 'ownable' || access == 'roles' || access == undefined)) {
            return;
        }

        const erc20Opts: ERC20Data = {
            name: name,
            symbol: symbol,
            burnable: burnable,
            pausable: pausable,
            premint: premint,
            mintable: mintable,
            permit: permit,
            accesss: access,
            flashmint: flashmint,
            snapshots: snapshots,
            votes: votes,
            info: {
                securityContact: securityContract,
                license: license,
            },
        };

        const nets = Object.values(networksData).map((n) => {
            return n.network;
        });

        const currentNetwork = await walletContext.web3Provider?.getNetwork();
        if (!currentNetwork) {
            return;
        }

        const currentChainId = currentNetwork.chainId.toString();
        const currentNetworkName = currentNetwork.name;

        if (!nets.includes(currentNetworkName)) {
            return;
        }

        // TODO: ERROR: Temporary solution for deployContract
        if (!(currentChainId == '80001' || currentChainId == '137')) {
            return;
        }

        setStep1Open(false);
        setStep2Open(true);

        setAfterDeploymentDesc('Generating Contarct . . .\n');

        const contractDetailsPromise = deployContract(
            erc20Opts,
            ERCs.ERC20,
            walletContext.web3Provider,
            currentChainId,
        );

        setAfterDeploymentDesc(afterDeploymentDesc + 'Deploying Contarct . . .\nAwaiting Wallet Confirmation . . .\n');

        const contractDetails = await contractDetailsPromise;

        if (contractDetails) {
            setAfterDeploymentDesc(afterDeploymentDesc + 'Deplyoment Successful . . .\n');
            setAfterDeploymentDesc(afterDeploymentDesc + '\n\n');
            setAfterDeploymentDesc(
                afterDeploymentDesc + 'Contarct Address: ' + contractDetails.contractAddress + ' \n',
            );

            const conrtractExplorerUrl =
                new URL(
                    path.join('tx', contractDetails.contractAddress),
                    networksData[currentChainId].blockExplorerURL,
                ).toString() + '/';

            setAfterDeploymentDesc(afterDeploymentDesc + 'View Details on: ' + conrtractExplorerUrl + ' \n');
        } else {
            setAfterDeploymentDesc(afterDeploymentDesc + 'Deplyoment Failed . . .\n');
        }

        // TODO: Show Deployement Details
        // setStep1Open(false);
        // setStep2Open(true);
    };

    return (
        <div>
            <header className="bg-gray-100">
                <div className="max-w-screen-xl px-4 py-8 mx-auto sm:py-12 sm:px-6 lg:px-8">
                    <div className="sm:justify-between sm:items-center sm:flex">
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">ERC20</h1>
                            <p className="mt-1.5 text-sm tracking-wide text-gray-500">
                                An ERC20 token contract keeps track of fungible tokens: any one token is exactly equal
                                to any other token; no tokens have special rights or behavior associated with them. This
                                makes ERC20 tokens useful for things like a medium of exchange currency, voting rights,
                                staking, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-6 max-w-screen-xl mx-auto space-y-4">
                <details id="step1" className="bg-white border border-black divide-gray-200 p-6" open={step1Open}>
                    <summary
                        className="flex cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <div>
                            <h2 className="text-xl font-semibold">Contract Details</h2>
                            <p className="text-sm ml-0.5">Enter Contract Details and choose your Network</p>
                        </div>
                    </summary>

                    <hr className="my-3 border-gray-300" />

                    <div className="grid grid-cols-1 mt-6 gap-4 max-w-md">
                        <TextInput
                            id="name"
                            label="Token Name"
                            type={TextInputTypes.TEXT}
                            value={name}
                            setValue={setName}
                        />
                        <TextInput
                            id="symbol"
                            label="Token Symbol"
                            type={TextInputTypes.TEXT}
                            value={symbol}
                            setValue={setSymbol}
                        />

                        <TextInput
                            id="premint"
                            label="Premint"
                            type={TextInputTypes.NUMBER}
                            value={premint}
                            setValue={setPremint}
                            minNum={1}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <CheckboxInput id="burnable" label="Burnable" value={burnable} setValue={setBurnable} />
                            <CheckboxInput id="snapshots" label="Snapshots" value={snapshots} setValue={setSnapshots} />
                            <CheckboxInput id="pausable" label="Pausable" value={pausable} setValue={setPausable} />
                            <CheckboxInput id="mintable" label="Mintable" value={mintable} setValue={setMintable} />
                            <CheckboxInput id="permit" label="Permit" value={permit} setValue={setPermit} />
                            <CheckboxInput id="votes" label="Votes" value={votes} setValue={setVotes} />
                            <CheckboxInput id="flashmint" label="Flashmint" value={flashmint} setValue={setFlashmint} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <DropdownInput
                                id="accesss"
                                label="Access Control"
                                value={access}
                                setValue={setAccess}
                                valueOptions={[
                                    {
                                        value: 'ownable',
                                        label: 'Ownable',
                                    },
                                    {
                                        value: 'roles',
                                        label: 'Roles',
                                    },
                                ]}
                            />
                            <DropdownInput
                                id="upgradeable"
                                label="Upgradeable"
                                value={upgradeable}
                                setValue={setUpgradeable}
                                valueOptions={[
                                    {
                                        value: 'false',
                                        label: 'False',
                                    },
                                    {
                                        value: 'transparent',
                                        label: 'Transparent',
                                    },
                                    {
                                        value: 'uups',
                                        label: 'Uups',
                                    },
                                ]}
                                disabled
                            />
                        </div>

                        <TextInput
                            id="securityContact"
                            label="Security Contact"
                            type={TextInputTypes.TEXT}
                            value={securityContract}
                            setValue={setSecurityContract}
                        />
                        <TextInput
                            id="license"
                            label="License"
                            type={TextInputTypes.TEXT}
                            value={license}
                            setValue={setLicense}
                        />

                        <TextInput
                            id="network"
                            label="Network"
                            type={TextInputTypes.TEXT}
                            value={networkName}
                            setValue={setNetworkName}
                            disabled={true}
                        />

                        <Button
                            title="Deploy"
                            onClick={() => {
                                handleStep1Submit();
                            }}
                            size="sm"
                        />
                    </div>
                </details>

                <details id="step2" className="bg-white border border-black divide-gray-200 p-6" open={step2Open}>
                    <summary
                        className="flex cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <div>
                            <h2 className="text-xl font-semibold">Deployment Details</h2>
                            <p className="text-sm ml-0.5">Find Contarct Deployment details</p>
                        </div>
                    </summary>

                    <hr className="my-3 border-gray-300" />

                    <p className="whitespace-pre-line">{afterDeploymentDesc}</p>
                </details>
            </div>
        </div>
    );
};

export default MintErc20;
