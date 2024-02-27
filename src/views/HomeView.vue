<script setup></script>

<template>
	<main>
		<h1>Tic Tac Toe dashboard</h1>
		<div class="grid">
			<router-link to="/play">
				<div class="gridItem center-all">Create a game</div>
			</router-link>
			<router-link to="/play">
				<div class="gridItem center-all">Join a game</div>
			</router-link>
		</div>
	</main>
</template>

<style>
	.grid {
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		gap: 2rem;

		margin-block: 2rem;
	}

	.gridItem {
		width: 200px;
		height: 200px;
		border: 1px solid var(--color-border);
		cursor: pointer;
	}
	.gridItem:hover {
		border: 2px solid var(--color-border-hover);
		font-weight: 500;
	}
</style>
