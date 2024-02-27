<template>
	<div>
		<dialog id="gameover" ref="gameOverDialog">
			<p v-if="isDraw">Match is Tied</p>
			<p v-else>Player {{ winner }} wins</p>
			<div class="button-group">
				<button class="btn btn-primary" @click="restartGame" id="btn-restart">
					Restart
				</button>
				<button class="btn btn-outline" @click="closeModal" id="btn-close">
					Close
				</button>
			</div>
		</dialog>
		<div id="timer">
			<Stopwatch
				:timer="timerValue"
				:playable="playable"
				@time-up="timesUp"
				:key="timerKey"
			></Stopwatch>
		</div>

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
					:turnComplete="turnComplete"
					:playable="playable"
					:turnNo="turn"
					:handleWinner="handleWinner"
					:key="boardKey"
				></GameBoard>
			</div>
		</div>
		<div class="gameinfo">
			<p>
				Player 1 (X):<span id="player1wins">{{ player1wins }}</span>
			</p>
			<p>
				Player 2 (O): <span id="player2wins">{{ player2wins }}</span>
			</p>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed } from "vue";
	import Stopwatch from "@/components/Stopwatch.vue";
	import GameBoard from "@/components/GameBoard.vue";

	const gameOverDialog = ref(null);

	const N = ref(3);
	const player1wins = ref(0);
	const player2wins = ref(0);
	const timerValue = ref(10);
	const isGameOver = ref(false);
	const isDraw = ref(false);
	const isPlaying = ref(false);
	const turn = ref(1);
	const move = ref(1);
	const winner = ref(null);

	const boardKey = ref(0);
	const timerKey = ref(0);

	const isPlayerActive = (player) => {
		return player == turn.value;
	};

	const turnComplete = () => {
		turn.value = turn.value == 1 ? 2 : 1;
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

	const handleWinner = (player, draw = false) => {
		isGameOver.value = true;
		isPlaying.value = false;

		if (draw) {
			isDraw.value = true;
			return;
		}

		if (player == 1) player1wins.value++;
		else player2wins.value++;

		winner.value = player;
	};

	const restartGame = () => {
		isGameOver.value = false;
		isDraw.value = false;
		isPlaying.value = true;

		winner.value = null;
		turn.value = 1;
		move.value = 1;

		boardKey.value++;
		timerKey.value++;
	};

	onMounted(() => {
		isPlaying.value = true;
	});
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
