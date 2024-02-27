<template>
	<div id="grid">
		<div
			v-for="item in N * N"
			:key="item"
			class="griditem"
			:id="'grid-' + item"
			@click="cellClicked(item - 1)"
		>
			<div v-if="board.length">
				<span v-if="getCellValue(item) == 1">X</span>
				<span v-if="getCellValue(item) == 2">O</span>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed } from "vue";

	const props = defineProps([
		"N",
		"turnComplete",
		"turnNo",
		"playable",
		"checkWinner",
		"handleWinner",
	]);
	const emit = defineEmits(["time-up"]);
	const N = ref(props.N);
	const board = ref([]);

	const turn = computed(() => {
		return props.turnNo;
	});
	const turnComplete = props.turnComplete;
	const playable = props.playable;
	const handleWinner = props.handleWinner;

	const setGridDimensions = () => {
		let gridtempcols = "";

		for (let i = 0; i < N.value; i++) {
			gridtempcols += "1fr ";
		}
		document.querySelector("#grid").style.gridTemplateColumns = gridtempcols;
		board.value = initBoard(N.value);
	};

	const initBoard = (n) => {
		let board = [];

		for (let i = 0; i < n; i++) {
			board[i] = new Array(n).fill(0);
		}

		return board;
	};

	const getBoardIndex = (cell) => {
		return [Math.floor(cell / N.value), cell % N.value];
	};

	const getCellValue = (cell) => {
		const boardIndex = getBoardIndex(cell - 1);

		return board.value[boardIndex[0]][boardIndex[1]];
	};

	const checkRowsMatch = (player) => {
		let isMatching = true;

		for (let i = 0; i < N.value; i++) {
			isMatching = true;
			for (let j = 0; j < N.value; j++) {
				if (player != board.value[i][j]) isMatching = false;
			}

			if (isMatching) return true;
		}

		return isMatching;
	};

	const checkColumnsMatch = (player) => {
		let isMatching = true;

		for (let i = 0; i < N.value; i++) {
			isMatching = true;
			for (let j = 0; j < N.value; j++) {
				if (player != board.value[j][i]) isMatching = false;
			}

			if (isMatching) return true;
		}

		return isMatching;
	};

	const checkLeftDiagonalsMatch = (player) => {
		let isMatching = true;

		for (let i = 0; i < N.value; i++) {
			if (player != board.value[i][i]) isMatching = false;
		}

		return isMatching;
	};

	const checkRightDiagonalsMatch = (player) => {
		let isMatching = true;

		for (let i = 0; i < N.value; i++) {
			if (player != board.value[i][N.value - i - 1]) isMatching = false;
		}

		return isMatching;
	};

	const checkWinner = (player) => {
		return (
			checkRowsMatch(player) ||
			checkColumnsMatch(player) ||
			checkLeftDiagonalsMatch(player) ||
			checkRightDiagonalsMatch(player)
		);
	};

	const checkDraw = () => {
		for (let i = 0; i < N.value; i++) {
			for (let j = 0; j < N.value; j++) {
				if (board.value[i][j] == 0) return false;
			}
		}
		return true;
	};

	const cellClicked = (cell) => {
		const boardIndex = getBoardIndex(cell);

		if (!playable() || board.value[boardIndex[0]][boardIndex[1]] != 0) return;

		board.value[boardIndex[0]][boardIndex[1]] = turn.value;

		const isWinner = checkWinner(turn.value);
		const isDraw = checkDraw();

		if (isWinner) {
			handleWinner(turn.value);
		} else if (isDraw) {
			handleWinner(turn.value, true);
		}

		turnComplete();
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
			font-size: 6rem;
			font-weight: 300;

			cursor: pointer;
		}

		.griditem:hover {
			background-color: #eee;
		}
	}
</style>
