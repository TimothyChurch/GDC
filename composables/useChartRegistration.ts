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
} from 'chart.js'

let registered = false

export function useChartRegistration() {
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
      Legend,
    )
    registered = true
  }
}
