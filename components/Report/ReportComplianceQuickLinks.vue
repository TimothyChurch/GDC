<template>
  <div class="bg-charcoal rounded-xl border border-brown/30 p-5">
    <h3 class="text-sm font-semibold text-parchment/70 mb-4">Quick Access — All Compliance Reports</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      <NuxtLink to="/admin/reports/ttb-production" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-blue-900/20 border border-transparent hover:border-blue-500/20 transition-all text-center">
        <UIcon name="i-lucide-flask-conical" class="text-blue-400 text-xl" />
        <span class="text-xs text-parchment/70">TTB Production</span>
        <span class="text-[10px] text-parchment/40">5110.11</span>
      </NuxtLink>
      <NuxtLink to="/admin/reports/ttb-storage" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-purple-900/20 border border-transparent hover:border-purple-500/20 transition-all text-center">
        <UIcon name="i-lucide-warehouse" class="text-purple-400 text-xl" />
        <span class="text-xs text-parchment/70">TTB Storage</span>
        <span class="text-[10px] text-parchment/40">5110.11</span>
      </NuxtLink>
      <NuxtLink to="/admin/reports/ttb-processing" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-emerald-900/20 border border-transparent hover:border-emerald-500/20 transition-all text-center">
        <UIcon name="i-lucide-package-check" class="text-emerald-400 text-xl" />
        <span class="text-xs text-parchment/70">TTB Processing</span>
        <span class="text-[10px] text-parchment/40">5110.28</span>
      </NuxtLink>
      <NuxtLink to="/admin/reports/ttb-excise-tax" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-gold/10 border border-transparent hover:border-gold/20 transition-all text-center">
        <UIcon name="i-lucide-receipt" class="text-gold text-xl" />
        <span class="text-xs text-parchment/70">TTB Excise Tax</span>
        <span class="text-[10px] text-parchment/40">5000.24</span>
      </NuxtLink>
      <NuxtLink to="/admin/reports/tabc-monthly" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-amber-900/20 border border-transparent hover:border-amber-500/20 transition-all text-center">
        <UIcon name="i-lucide-file-text" class="text-amber-400 text-xl" />
        <span class="text-xs text-parchment/70">TABC Monthly</span>
        <span class="text-[10px] text-parchment/40">TX Production</span>
      </NuxtLink>
      <NuxtLink to="/admin/reports/tabc-excise-tax" class="flex flex-col items-center gap-1 p-3 rounded-lg bg-brown/10 hover:bg-amber-900/20 border border-transparent hover:border-amber-500/20 transition-all text-center">
        <UIcon name="i-lucide-landmark" class="text-amber-500 text-xl" />
        <span class="text-xs text-parchment/70">TABC Excise Tax</span>
        <span class="text-[10px] text-parchment/40">§ 201.43</span>
      </NuxtLink>
    </div>
  </div>
</template>
