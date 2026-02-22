import {
	Chart,
	Title,
	Tooltip,
	Legend,
	BarElement,
	LineElement,
	PointElement,
	ArcElement,
	CategoryScale,
	LinearScale,
	DoughnutController,
	Filler,
} from 'chart.js';
export default defineNuxtPlugin(() => {
	Chart.register(
		CategoryScale,
		LinearScale,
		BarElement,
		LineElement,
		PointElement,
		ArcElement,
		DoughnutController,
		Filler,
		Title,
		Tooltip,
		Legend
	);
});
