import { initializeSdk } from './utils/initializeSdk';

window.addEventListener('DOMContentLoaded', setupParentIframe);

async function setupParentIframe() {
	const discordSdk = await initializeSdk();
	notifyChildParentIsReady();

	async function handleMessage(event) {
		const messageData = event.data;

		// Bail out if messageData is not an "{}" object
		if (
			typeof messageData !== 'object' ||
			Array.isArray(messageData) ||
			messageData === null
		) {
			return;
		}

		const { nonce, event: eventType, command, data, args } = messageData;

		function handleSubscribeEvent(eventData) {
			getChildIframe().contentWindow?.postMessage(
				{
					event: eventType,
					command: 'DISPATCH',
					data: eventData,
				},
				'*'
			);
		}

		switch (command) {
			case 'NOTIFY_CHILD_IFRAME_IS_READY': {
				notifyChildParentIsReady();
				break;
			}
			case 'SUBSCRIBE': {
				if (eventType == null) {
					throw new Error('SUBSCRIBE event is undefined');
				}
				discordSdk.subscribe(eventType, handleSubscribeEvent, args);
				break;
			}
			case 'UNSUBSCRIBE': {
				if (eventType == null) {
					throw new Error('UNSUBSCRIBE event is undefined');
				}
				discordSdk.unsubscribe(eventType, handleSubscribeEvent);
				break;
			}
			case 'SET_ACTIVITY': {
				const reply = await discordSdk.commands.setActivity(data);
				getChildIframe().contentWindow?.postMessage(
					{ nonce, event: eventType, command, data: reply },
					'*'
				);
				break;
			}
		}
	}

	window.addEventListener('message', handleMessage);
}

function getChildIframe() {
	const iframe = document.getElementById('child-iframe');
	if (!iframe) {
		throw new Error('Child iframe not found');
	}
	return iframe;
}

function notifyChildParentIsReady() {
	const iframe = getChildIframe();
	iframe.contentWindow?.postMessage(
		{
			event: 'READY',
			command: 'DISPATCH',
		},
		'*'
	);
}
