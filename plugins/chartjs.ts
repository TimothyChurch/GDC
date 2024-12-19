import {
	Chart,
	Title,
	Tooltip,
	Legend,
	BarElement,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
} from 'chart.js';
export default defineNuxtPlugin(() => {
	Chart.register(
		CategoryScale,
		LinearScale,
		BarElement,
		LineElement,
		PointElement,
		Title,
		Tooltip,
		Legend
	);
});
