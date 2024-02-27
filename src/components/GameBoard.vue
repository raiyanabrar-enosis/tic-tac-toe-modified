<template>
	<div id="grid">
		<div
			v-for="item in N * N"
			:key="item"
			class="griditem"
			:id="'grid-' + item"
			@click="cellClicked(item - 1)"
		>
			<div v-if="board && board.length">
				<span v-if="getCellValue(item) == 1">X</span>
				<span v-if="getCellValue(item) == 2">O</span>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed } from "vue";
	import { socket } from "@/utils/websocket.js";

	const props = defineProps([
		"N",
		"turnComplete",
		"turnNo",
		"playable",
		"checkWinner",
		"handleWinner",
	]);
	const emit = defineEmits(["time-up", "game-id", "change-turn"]);
	const N = ref(props.N);
	const board = ref([]);
	const gameID = ref();

	const turn = computed(() => {
		return props.turnNo;
	});
	const turnComplete = props.turnComplete;
	const playable = props.playable;
	const handleWinner = props.handleWinner;

	const initBoard = async () => {
		const res = await fetch("http://localhost:3000/game/new/" + N.value);
		const gamedata = await res.json();
		board.value = gamedata.data.board;
		gameID.value = gamedata.data.id;
		emit("game-id", gameID.value);
	};

	// -----------------

	const setGridDimensions = () => {
		let gridtempcols = "";

		for (let i = 0; i < N.value; i++) {
			gridtempcols += "1fr ";
		}
		document.querySelector("#grid").style.gridTemplateColumns = gridtempcols;

		initBoard();
	};

	const getBoardIndex = (cell) => {
		return [Math.floor(cell / N.value), cell % N.value];
	};

	const getCellValue = (cell) => {
		const boardIndex = getBoardIndex(cell - 1);

		return board.value[boardIndex[0]][boardIndex[1]];
	};

	const createMove = async (move, player) => {
		const post = await fetch("http://localhost:3000/game/move/create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id: gameID.value,
				move: move,
				player: player,
			}),
		});
		const res = await post.json();
		socket.send(JSON.stringify(res.data));
		return res.data;
	};

	const cellClicked = async (cell) => {
		const boardIndex = getBoardIndex(cell);

		if (!playable() || board.value[boardIndex[0]][boardIndex[1]] != 0) return;

		board.value[boardIndex[0]][boardIndex[1]] = turn.value;

		const currentMove = await createMove(boardIndex, turn.value);

		const isWinner = currentMove.isWinner;
		const isDraw = currentMove.isDraw;

		board.value = currentMove.boardstate;

		if (isWinner) {
			handleWinner(turn.value);
		} else if (isDraw) {
			handleWinner(turn.value, true);
		}

		turnComplete(currentMove.nextTurn);
	};

	onMounted(() => {
		setGridDimensions();
	});
</script>

<style scoped>
	#steps {
		position: absolute;
		left: 7%;
		list-style-type: disclosure-closed;
	}
	#steps li {
		margin-block: 0.5rem;
		text-decoration: underline;
		cursor: pointer;
	}
	#steps li:hover {
		color: orange;
	}

	#grid {
		border: 20px solid #333;
		display: grid;
		gap: 1rem;
		padding: 2rem;
		width: 600px;

		.griditem {
			width: 100%;
			height: auto;
			aspect-ratio: 1;
			border: 1px solid #333;
			border-radius: 8px;

			display: flex;
			align-items: center;
			justify-content: center;

			font-family: Arial, Helvetica, sans-serif;
			font-size: 2.5rem;
			font-weight: 300;

			cursor: pointer;
		}

		.griditem:hover {
			background-color: #eee;
		}
	}
</style>
