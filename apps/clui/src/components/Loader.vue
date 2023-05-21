<template>
  <div class="animate-pulse flex relative w-max">
    <Icon name="svg-spinners:blocks-wave" class="w-16 h-16 text-neutral-600 animate-pulse"></Icon>
    <Icon name="svg-spinners:blocks-wave" class="-ml-[5.5px] w-16 h-16 text-neutral-600 animate-pulse"></Icon>
    <Icon name="svg-spinners:blocks-wave" class="-ml-[5.5px] w-16 h-16 text-neutral-600 animate-pulse"></Icon>
    <Icon name="svg-spinners:blocks-wave" class="-ml-[5.5px] w-16 h-16 text-neutral-600 animate-pulse"></Icon>
    <div class="absolute text-neutral-600/50 animate-pulse inset-0 flex items-center justify-center">
      <div class="w-max flex animate-pulse">
        <p
          v-for="(char, i) in 'loading...'"
          class="animate-bounce"
          :style="`animation-delay: -${1 / Math.abs('loading...'.length / 2 - i)}s`"
        >
          {{ char }}
        </p>
      </div>
    </div>
  </div>
</template>
