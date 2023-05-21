<template>
  <label class="grid gap-1">
    <p v-if="label" class="text-sm text-neutral-50">{{ label }}</p>
    <SenpCard class="grid gap-2">
      <p v-if="description" class="text-sm text-neutral-200">{{ description }}</p>
      <div v-for="(entry, i) in list" :key="i" class="w-full flex gap-4 items-center">
        <SenpTextInput
          :classes="{ wrapper: { extend: 'w-full' }, input: { extend: 'placeholder-neutral-500' } }"
          v-for="(_input, j) in entry"
          :key="i + '-' + j"
          v-model="list[i][j]"
          :placeholder="labels[j] ?? j + ''"
        />

        <SenpButton class="w-max shrink-0" @click="() => list.splice(i, 1)" theme="tertiary">
          <Icon name="mdi:trash-can"></Icon>
        </SenpButton>
      </div>
      <SenpButton @click="() => list.push(Array.from({ length: labels.length }).map(() => ''))">
        <Icon name="mdi:plus" size="20"></Icon>
        <p>Add Entry</p>
      </SenpButton>
    </SenpCard>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string[][]
    labels: string[]
    label: string
    description?: string
    editing: boolean
  }>(),
  { editing: false }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[][]): void
}>()

const editing = ref(props.editing)
const list = ref(props.modelValue)

watch(
  list,
  () => {
    emit('update:modelValue', list.value)
  },
  { deep: true }
)
</script>
