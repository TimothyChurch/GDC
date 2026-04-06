import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, DoughnutController, Filler, Title, Tooltip, Legend } from 'chart.js';

let registered = false;
function useChartRegistration() {
  if (!registered) {
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
    registered = true;
  }
}

export { useChartRegistration as u };
//# sourceMappingURL=useChartRegistration-vDVtbpQr.mjs.map
