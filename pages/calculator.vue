<script setup>
const data = reactive({
  weight: null,
  weight_unit: null,
  abv: null,
  target_abv: 40,
  water_added: null,
  water_added_unit: "L",
  new_abv: null,
});

const volume = () => {
  let density_alc, density_water, density;
    
  density_alc = 0.789;
  density_water = 1.0;
  density =
    (data.abv / 100) * density_alc + density_water * (1 - data.abv / 100);
    console.log(density)
    console.log(data.weight)

  if (data.weight_unit == "kg") {
    return data.weight / density;
  } else {
    return ((data.weight*.453592) / density )
  }
};

const final_volume = () => {
  return (volume() * data.abv) / data.target_abv;
};

const new_volume = () => {
  return -(data.water_added * data.abv) / (data.new_abv - data.abv);
};

const total_volume = () => {
  return new_volume() * data.new_abv / data.target_abv
}

const literToGal = (x) => {
  return (x / 3.78541)
}
</script>

<template>
  <div>
    <div class="space-y-12 flex justify-center">
      <div class="flex flex-col w-3/4">
        <div class="mt-10 grid grid-cols-8 justify-center gap-x-6 gap-y-8">
          <div class="">
            <label
              for="weight"
              class="block text-sm/6 font-medium text-gray-900"
              >Weight</label
            >
            <div class="mt-2">
              <input
                type="text"
                name="weight"
                id="weight"
                v-model="data.weight"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div class="">
            <label for="unit" class="block text-sm/6 font-medium text-gray-900"
              >Unit</label
            >
            <select
              id="unit"
              name="unit"
              v-model="data.weight_unit"
              class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6"
            >
              <option>lb</option>
              <option>kg</option>
            </select>
          </div>

          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >ABV</label
            >
            <div class="flex mt-2">
              <input
                type="text"
                name="abv"
                id="abv"
                v-model="data.abv"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Volume</label
            >
            <div class="flex mt-2">
              {{ literToGal(volume()).toFixed(2) }} gal /
              {{ volume().toFixed(2) }} L
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Target ABV</label
            >
            <div class="flex mt-2">
              <input
                type="text"
                name="abv"
                id="abv"
                v-model="data.target_abv"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Final Volume</label
            >
            <div class="flex mt-2">
              {{ literToGal(final_volume()).toFixed(2) }} gal / 
              {{ final_volume().toFixed(2) }} L
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Water Needed</label
            >
            <div class="flex mt-2">
              {{  literToGal((final_volume() - volume())).toFixed(2) }} gal /
              {{ (final_volume() - volume()).toFixed(2) }} L
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Recommended Addition</label
            >
            <div class="flex mt-2">
              {{ ((final_volume() - volume()) * 0.75).toFixed(2) }}
            </div>
          </div>
        </div>
        <div class="mt-10 grid grid-cols-7 justify-center gap-x-6 gap-y-8">
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Water Added</label
            >
            <div class="flex mt-2">
              <input
                type="text"
                name="abv"
                id="abv"
                v-model="data.water_added"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div class="">
            <label for="unit" class="block text-sm/6 font-medium text-gray-900"
              >Unit</label
            >
            <select
              id="unit"
              name="unit"
              v-model="data.water_added_unit"
              class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6"
            >
              <option>L</option>
              <option>gal</option>
            </select>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >New ABV</label
            >
            <div class="flex mt-2">
              <input
                type="text"
                name="abv"
                id="abv"
                v-model="data.new_abv"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >New Volume</label
            >
            <div class="flex mt-2">
              {{ new_volume().toFixed(2) }}
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Total Volume</label
            >
            <div class="flex mt-2">
              {{ total_volume().toFixed(2) }}
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Water Needed</label
            >
            <div class="flex mt-2">
              {{ (total_volume() - new_volume()).toFixed(2) }}
            </div>
          </div>
          <div class="">
            <label for="abv" class="block text-sm/6 font-medium text-gray-900"
              >Recommended Addition</label
            >
            <div class="flex mt-2">
              {{ ((total_volume() - new_volume()) * 0.75).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
