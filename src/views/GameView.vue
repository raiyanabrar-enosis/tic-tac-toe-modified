<template>
	<div>
		<!-- <div id="timer">
			<Stopwatch
				:timer="timerValue"
				:playable="playable"
				@time-up="timesUp"
				:key="timerKey"
			></Stopwatch>
		</div> -->

		<h1 class="gameHeader">Tic Tac Toe</h1>

		<div class="gamearea">
			<div class="board">
				<div class="gameTopbar">
					<span id="restart" @click="restartGame">&#8635;</span>
					<div v-if="isGameOver">
						<p class="win" v-if="isDraw">Match is Tied</p>
						<p class="win" v-else>Player {{ winner }} wins</p>
					</div>
					<div v-else>
						<p class="active">Player {{ turn }}'s turn</p>
					</div>
				</div>

				<GameBoard
					:N="N"
					:turnNo="turn"
					:isMultiplayer="isMultiplayer"
					:turnComplete="turnComplete"
					:playable="playable"
					:handleWinner="handleWinner"
					:key="boardKey"
					@game-id="setGameId"
					@multiplayer-filled="startMultiplayerGame"
					@multiplayer-move-fn="setMultiplayerFn"
					@player-move="setMultiplayerMove"
				></GameBoard>
			</div>
		</div>
		<div class="gameinfo">
			<p>
				Player 1 (X): <span id="player1wins">{{ player1wins }}</span>
			</p>
			<p>
				Player 2 (O): <span id="player2wins">{{ player2wins }}</span>
			</p>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, onBeforeUnmount, onUnmounted, computed } from "vue";
	import { useRouter } from "vue-router";

	import Stopwatch from "@/components/Stopwatch.vue";
	import GameBoard from "@/components/GameBoard.vue";

	const router = useRouter();
	const socket = ref();

	const playerName = ref("");
	const N = ref(3);
	const player1wins = ref(0);
	const player2wins = ref(0);
	const timerValue = ref(10);
	const isGameOver = ref(false);
	const isDraw = ref(false);
	const isPlaying = ref(false);
	const isMultiplayer = ref(false);
	const turn = ref(1);
	const winner = ref(0);

	const move = ref(1);
	const steps = ref([]);

	const boardKey = ref(0);
	const timerKey = ref(0);

	const gameID = ref();

	let multiplayerMoveFn = null;

	const turnComplete = (nextTurn) => {
		turn.value = nextTurn;
		move.value++;
		timerKey.value++;
	};

	const playable = () => {
		return isPlaying.value && !isGameOver.value;
	};

	const timesUp = () => {
		turn.value = turn.value == 1 ? 2 : 1;
		handleWinner(turn.value);
	};

	const setGameId = (id) => {
		gameID.value = id;
	};

	const handleWinner = (player, draw = false, isHost) => {
		isGameOver.value = true;
		isPlaying.value = false;
		console.log(isHost);

		if (draw) {
			isDraw.value = true;
			saveFinishedGame(isHost);
			return;
		}

		if (player == 1) player1wins.value++;
		else player2wins.value++;

		winner.value = player;

		saveFinishedGame(isHost);
	};

	const getSteps = async () => {
		const post = await fetch("http://localhost:3000/game/steps", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id: gameID.value,
			}),
		});

		const res = await post.json();
		return res.data;
	};

	const saveFinishedGame = async (isHost) => {
		console.log(isHost);
		// Only winner can save
		if (
			isMultiplayer.value &&
			((winner.value != 0 && isHost != winner.value) ||
				(isHost == 2 && winner.value == 0))
		)
			return;

		const steps = await getSteps();

		const post = await fetch("http://localhost:3000/game/save", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				winner: winner.value,
				winnerName:
					isMultiplayer.value && winner.value != 0
						? playerName.value
						: "Player " + winner.value,
				isMultiplayer: isMultiplayer.value,
				steps: steps,
				moves: move.value,
				boardSize: N.value,
			}),
		});

		const res = await post.json();

		return await removeGame();
	};

	const removeGame = async () => {
		const steps = await getSteps();

		const post = await fetch(
			"http://localhost:3000/game/remove?id=" + gameID.value
		);

		return await post.json();
	};

	const checkMultiplayer = async () => {
		const url = new URL(window.location.href);
		const searchParams = url.searchParams;
		const gameType = searchParams.get("gametype");

		if (gameType == 1) {
			isMultiplayer.value = true;
			isPlaying.value = false;
			// boardKey.value++;

			const sock = await import("@/utils/websocket.js");
			socket.value = sock.socket;
			setupSockets();
			askForName();
		}
	};

	const startMultiplayerGame = async () => {
		const interval = setInterval(() => {
			if (socket.value.readyState) {
				socket.value.send(
					JSON.stringify({
						id: gameID.value,
						type: "START",
					})
				);
				isPlaying.value = true;
				clearInterval(interval);
			}
		}, 100);
	};

	const setMultiplayerFn = (fn) => {
		multiplayerMoveFn = fn;
	};

	const setMultiplayerMove = (move) => {
		socket.value.send(
			JSON.stringify({
				id: gameID.value,
				type: "MOVE",
				data: move,
			})
		);
	};

	const restartGame = () => {
		isGameOver.value = false;
		isDraw.value = false;
		isPlaying.value = true;

		winner.value = 0;
		turn.value = 1;
		move.value = 1;

		boardKey.value++;
		timerKey.value++;
	};

	const setupSockets = () => {
		socket.value.onmessage = function (event) {
			const data = JSON.parse(event.data);

			if (data.type == "START" && data.id == gameID.value) {
				console.log("GAME CAN START NOWWWW!!!!");
				isPlaying.value = true;
			} else if (data.type == "MOVE") {
				multiplayerMoveFn(data.data);
			}
		};
	};

	const askForName = () => {
		const name = prompt("Enter your name");

		if (name) playerName.value = name;
	};

	onMounted(() => {
		restartGame();
		checkMultiplayer();
	});

	window.onbeforeunload = function () {
		if (!isMultiplayer.value) removeGame();
	};
</script>

<style scoped>
	.gameHeader {
		text-align: center;
		margin-block: 1rem;
	}

	.gameTopbar {
		height: 32px;
		margin-block: 0.5rem;

		div {
			width: 93%;
			display: inline-block;
		}

		#restart {
			cursor: pointer;
			font-size: 1.25rem;
			font-weight: 700;
			font-family: "Lucida Sans Unicode";
		}
		#restart:hover {
			opacity: 0.5;
		}

		p {
			text-align: center;
			font-size: 1.25rem;
		}
		p.active {
			font-weight: 500;
			color: #6c5ce7;
		}
		p.win {
			font-weight: 700;
			color: #00b894;
		}
	}

	.gamearea {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 2rem;
	}

	.gameinfo {
		margin-top: 2rem;
		p {
			text-align: center;
			font-size: 1.5rem;
		}
	}

	::backdrop {
		background-color: rgb(0, 0, 0, 0.65);
		height: 100%;
	}
	dialog {
		width: 400px;
		height: 165px;
		outline: none;
		border: none;
		margin: auto;
		font-size: 1.5rem;
		text-align: center;
	}

	.btn {
		outline: none;
		border: none;
		cursor: pointer;
		width: 100px;
		height: 36px;
		margin-block: 1rem;
	}

	.btn-primary {
		background-color: #6c5ce7;
		color: white;
	}

	.btn-outline {
		background-color: transparent;
		border: 1px solid #333;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
</style>
