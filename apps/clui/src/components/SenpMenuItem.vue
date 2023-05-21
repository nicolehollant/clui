<template>
  <HeadlessMenuItem v-slot="{ active }">
    <button
      v-bind="$attrs"
      class="transition duration-200 group flex w-full items-center px-2 py-2 text-sm gap-4"
      :class="{
        [activeClass]: active,
        'text-neutral-200': !active,
        'rounded-md': rounded === 'all',
        'rounded-t-md': rounded === 'top',
        'rounded-b-md': rounded === 'bottom',
      }"
    >
      <slot>
        <Icon v-if="leading" :name="leading"></Icon>
        <p>
          {{ label }}
        </p>
        <Icon v-if="trailing" :name="trailing" class="ml-auto"></Icon>
      </slot>
    </button>
  </HeadlessMenuItem>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    activeClass?: string
    label?: string
    leading?: string
    trailing?: string
    rounded?: 'top' | 'bottom' | 'none' | 'all'
  }>(),
  {
    rounded: 'all',
    activeClass: 'bg-blue-700/50 text-blue-100',
  }
)
</script>
