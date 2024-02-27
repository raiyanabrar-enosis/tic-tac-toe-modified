<template>
	<div>
		<span id="timer">{{ timer }}</span>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed } from "vue";

	const props = defineProps(["timer", "playable"]);
	const emit = defineEmits(["time-up"]);

	const timerValue = props.timer;
	const playable = props.playable;
	const timer = ref(timerValue);

	const startTimer = () => {
		setInterval(() => {
			if (!playable() || timer.value == 0) return;

			if (timer.value > 0) timer.value--;

			if (timer.value == 0) {
				emit("time-up");
			}
		}, 1000);
	};

	onMounted(() => {
		startTimer();
	});
</script>

<style scoped>
	#timer {
		position: fixed;
		right: 2%;
		top: 1%;
		font-size: 4rem;
		font-family: "Times New Roman", Times, serif;
	}
</style>
