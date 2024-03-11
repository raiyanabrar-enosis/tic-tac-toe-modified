import { defineStore } from "pinia";
import axios from "axios";

export const useRequestStore = defineStore("request", () => {
	const baseURL = import.meta.env.VITE_BASE_URL;

	async function get(url) {
		const { data } = await axios.get(baseURL + url);
		return data.data;
	}

	async function post(url, body) {
		const { data } = await axios.post(baseURL + url, body);
		return data.data;
	}

	return { baseURL, get, post };
});
