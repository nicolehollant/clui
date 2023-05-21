<template>
  <label :class="$xClass('grid gap-1', classes?.wrapper)">
    <slot name="label">
      <p :class="$xClass('text-sm text-neutral-50', classes?.label)" v-if="label">{{ label }}</p>
    </slot>
    <div
      :class="
        $xClass(
          [
            'relative focus-within:ring grid w-full rounded-lg bg-neutral-800 p-2 font-medium text-neutral-50 border outline-none ring-offset-0 ',
            error ? 'border-red-700' : 'border-neutral-700',
          ].join(' '),
          classes?.input
        )
      "
    >
      <textarea
        class="!p-0 outline-none ring-0 border-0 ring-offset-0 bg-transparent col-start-1 row-start-1 inset-0 resize-none font-sans focus:outline-none border-none focus:ring-0 ring-transparent ring-offset-transparent"
        v-bind="$attrs"
        :value="modelValue"
        @input="e => $emit('update:modelValue', (e as any).target.value)"
      />
      <div
        class="invisible col-start-1 row-start-1 whitespace-pre-wrap w-full h-full break-all font-sans"
        v-text="modelValue + ' '"
      ></div>
    </div>
    <slot name="hint">
      <p :class="$xClass('text-xs italic text-neutral-300', classes?.hint)" v-if="hint">{{ hint }}</p>
    </slot>
    <slot name="error">
      <p :class="$xClass('text-sm text-red-300', classes?.error)" v-if="error">{{ error }}</p>
    </slot>
  </label>
</template>

<script setup lang="ts">
import { XClass } from 'senp-ui/src/plugins/xClass'

defineEmits<{
  (event: 'update:modelValue', newValue: string): void
}>()
defineProps<{
  modelValue: string
  label?: string
  hint?: string
  error?: string
  type?: string
  classes?: {
    wrapper?: XClass
    label?: XClass
    input?: XClass
    hint?: XClass
    error?: XClass
  }
}>()
</script>
