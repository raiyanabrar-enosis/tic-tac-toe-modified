export let socket = new WebSocket("ws://localhost:6969");

socket.onopen = function (e) {
	console.log("[open] Connection established");
};

socket.onmessage = function (event) {
	const msg = JSON.parse(event.data);
	console.log(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function (event) {
	if (event.wasClean) {
		console.log(
			`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
		);
	} else {
		alert("[close] Connection died");
	}
};

socket.onerror = function (error) {
	alert(`[error]`);
};
