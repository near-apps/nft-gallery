import React, { useContext, useEffect, useState } from 'react';

import { appStore, onAppMount } from './state/app';
import { getForOwner, getAll } from './state/near';
import { useHistory } from './utils/history';

import { Token } from './components/Token';

import NearLogo from 'url:./img/near_icon.svg';

import './App.scss';

const PATH_SPLIT = '?c='
const SUB_SPLIT = '&t='

const App = () => {
	const { state, dispatch, update } = useContext(appStore);
	const { contracts, app: { loading, snack } } = state

	const [owner, setOwner] = useState('')
	const [path, setPath] = useState(window.location.href)
	useHistory(() => {
		setPath(window.location.href)
	});
	let contractIndex, contract, contractId, tokenId
	let pathSplit = path.split(PATH_SPLIT)[1]?.split(SUB_SPLIT)
	if (contracts.length && pathSplit?.length > 0) {
		contractId = pathSplit[0]
		contractIndex = contracts.findIndex(({ id }) => id === contractId)
		contract = contracts[contractIndex]
		tokenId = pathSplit[1]
	}

	useEffect(() => dispatch(onAppMount()), []);
	useEffect(() => {
		if (!!contracts.length && path.indexOf(PATH_SPLIT) === -1) {
			const contract = contracts.find(({ tokens }) => tokens.length === Math.max(...contracts.map(({ tokens }) => tokens.length)))
			history.pushState({}, '', PATH_SPLIT + contract.id)
		}
		if (contract && !contract.tokens.length) {
			const contractWithTokens = contracts.find(({ tokens }) => tokens.length > 0)
			if (contractWithTokens) {
				history.pushState({}, '', PATH_SPLIT + contractWithTokens.id)
			}
		}
	}, [contracts]);

	const handleGetForOwner = async (e) => {
		if (e && e.keyCode !== 13) {
			return
		}
		if (!owner.length) {
			return dispatch(snackAttack('Enter an owner accountId you want to check!'))
		}
		const result = await dispatch(getForOwner(owner))
		if (!result) {
			return setOwner('')
		}
	}

	const handleContract = (e) => {
		if (e.clientX > window.innerWidth * 0.75) {
			let nextIndex = contractIndex + 1
			if (nextIndex === contracts.length) {
				nextIndex = 0
			}
			history.pushState({}, '', PATH_SPLIT + contracts[nextIndex].id)
		} else if (e.clientX < window.innerWidth * 0.25) {
			let nextIndex = contractIndex - 1
			if (nextIndex === -1) {
				nextIndex = contracts.length - 1
			}
			history.pushState({}, '', PATH_SPLIT + contracts[nextIndex].id)
		} else {
			window.scrollTo(0, 0)
		}
	}

	return <>
		{
			loading && <div className="loading"><img src={NearLogo} /></div>
		}
		{
			tokenId &&
			<Token {...{ dispatch, contracts, contractId, tokenId }} />
		}
		{
			snack &&
			<div className="snack">
				{snack}
			</div>
		}

		{
			contract && <div className="contract">
				<div className="contract-controls" onClick={(e) => handleContract(e)}>
					<h1>{ contract.name }</h1>
					<div id="arrows" onClick={(e) => document.querySelector('#arrows').style.display = 'none'}>
						<div>⬅️</div>
						<div>⬆️</div>
						<div>➡️</div>
					</div>
				</div>

				<div className="menu">
					<input type="text" placeholder="Account ID" value={owner} onChange={(e) => setOwner(e.target.value)} onKeyUp={(e) => handleGetForOwner(e)} />
					<button onClick={() => handleGetForOwner()}>Get</button>
					<button onClick={() => {
						setOwner('')
						dispatch(getAll())
					}}>All NFTs</button>
				</div>

				<div className="tokens">
					{
						!contract.tokens.length && <div className="cover" onClick={(e) => handleContract(e)}>You don't own any tokens here. Click left or right to check other NFTs.</div>
					}
					{
						contract.tokens.map(({
							token_id,
							displayFrag,
							displayHowLongAgo
						}) => {
							return <div key={token_id} onClick={() => history.pushState({}, '', PATH_SPLIT + contract.id + SUB_SPLIT + token_id)}>
								{displayFrag}
								<div className="token-detail">
									<div>{token_id}</div>
									<div className="time">Minted {displayHowLongAgo} ago</div>
								</div>
							</div>
						})
					}
				</div>
			</div>
		}
	</>;
};

export default App;
