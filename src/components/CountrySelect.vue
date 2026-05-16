<script setup lang="ts">
import { ref, computed } from 'vue'
import { countries } from '../assets/countries'
import type { Country } from '../assets/countries'

const props = defineProps<{ modelValue: Country }>()
const emit = defineEmits<{ 'update:modelValue': [c: Country] }>()

const showDropdown = ref(false)
const countrySearch = ref('')

const filteredCountries = computed(() => {
  const q = countrySearch.value.toLowerCase()
  if (!q) return countries
  return countries.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
  )
})

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) countrySearch.value = ''
}

function closeDropdown() {
  showDropdown.value = false
  countrySearch.value = ''
}

function selectCountry(c: Country) {
  emit('update:modelValue', c)
  showDropdown.value = false
  countrySearch.value = ''
}
</script>

<template>
  <div class="country-select" @blur="closeDropdown">
    <button type="button" class="country-btn" @click="toggleDropdown">
      <span>{{ modelValue.flag }}</span>
      <span>{{ modelValue.dial }}</span>
    </button>
    <div v-if="showDropdown" class="country-dropdown">
      <input
        v-model="countrySearch"
        type="text"
        class="country-search"
        placeholder="搜索国家/地区"
      />
      <div class="country-list">
        <div
          v-for="c in filteredCountries"
          :key="c.code"
          class="country-option"
          @mousedown.prevent="selectCountry(c)"
        >
          <span>{{ c.flag }}</span>
          <span>{{ c.name }}</span>
          <span>{{ c.dial }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
