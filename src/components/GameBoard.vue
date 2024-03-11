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
	import { useRequestStore } from "@/stores/request";

	const request = useRequestStore();

	const props = defineProps([
		"N",
		"turnComplete",
		"turnNo",
		"playable",
		"checkWinner",
		"handleWinner",
		"setMultiplayerPlayerNo",
		"isMultiplayer",
	]);
	const emit = defineEmits([
		"time-up",
		"game-id",
		"change-turn",
		"multiplayer-filled",
		"multiplayer-move-fn",
		"player-move",
	]);
	const N = ref(props.N);
	const board = ref([]);
	const gameID = ref();

	const turn = computed(() => {
		return props.turnNo;
	});

	const isMultiplayer = props.isMultiplayer;
	const turnComplete = props.turnComplete;
	const playable = props.playable;
	const handleWinner = props.handleWinner;
	const setMultiplayerPlayerNo = props.setMultiplayerPlayerNo;

	const multiplayerNo = ref();

	const initBoard = async () => {
		const gamedata = await request.get(
			`/game/new?boardsize=${N.value}&multiplayer=${isMultiplayer}`
		);

		board.value = gamedata.board;
		gameID.value = gamedata.id;
		emit("game-id", gameID.value);

		if (isMultiplayer) {
			// If players are filled
			// send socket to player 1 to begin
			// start property = true is only sent to the second player after successfully joining
			if (gamedata.start) {
				emit("multiplayer-filled");
				multiplayerNo.value = 2;
			} else {
				multiplayerNo.value = 1;
			}
			emit("multiplayer-move-fn", multiplayerMove);
			setMultiplayerPlayerNo(multiplayerNo.value);
		}
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

	const cellClicked = async (cell) => {
		const boardIndex = getBoardIndex(cell);

		if (!playable() || board.value[boardIndex[0]][boardIndex[1]] != 0) return;
		if (isMultiplayer && multiplayerNo.value != turn.value) return;

		board.value[boardIndex[0]][boardIndex[1]] = turn.value;

		const currentMove = await request.post("/game/move/create", {
			id: gameID.value,
			move: boardIndex,
			player: turn.value,
		});

		if (isMultiplayer) emit("player-move", currentMove);

		const isWinner = currentMove.isWinner;
		const isDraw = currentMove.isDraw;

		board.value = currentMove.boardstate;

		if (isWinner || isDraw) {
			handleWinner(currentMove);
		}

		turnComplete(currentMove.nextTurn);
	};

	const multiplayerMove = (move) => {
		board.value = move.boardstate;

		turnComplete(move.nextTurn);
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
