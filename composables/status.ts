export const ageVerified = ref(false);

if (import.meta.client) {
  ageVerified.value = localStorage.getItem('ageVerified') === 'true';
  watch(ageVerified, (val) => {
    localStorage.setItem('ageVerified', String(val));
  });
}

export const BATCH_STAGES = [
  { name: 'Upcoming', icon: 'i-lucide-calendar-clock', color: 'blue' },
  { name: 'Brewing', icon: 'i-lucide-flame', color: 'orange' },
  { name: 'Fermenting', icon: 'i-lucide-beaker', color: 'yellow' },
  { name: 'Distilling', icon: 'i-lucide-flask-conical', color: 'copper' },
  { name: 'Storage', icon: 'i-lucide-warehouse', color: 'purple' },
  { name: 'Barreled', icon: 'i-lucide-cylinder', color: 'amber' },
  { name: 'Bottled', icon: 'i-lucide-wine', color: 'green' },
] as const;
