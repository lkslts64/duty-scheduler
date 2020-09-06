<template>
  <div>
    <h1>{{ "Step " + step.toString() }}</h1>
    <keep-alive>
      <component :is="componentNames[step - 1]"> </component>
    </keep-alive>
    <button @click="dec()" :disabled="isFirst">
      Previous
    </button>
    <button @click="inc()" :disabled="step >= totalSteps">Next</button>
  </div>
</template>

<script>
export default {
  props: {
    totalSteps: Number,
    currentStep: Number,
    componentNames: Array,
  },
  data: function() {
    return {
      step: this.currentStep,
    }
  },
  computed: {
    isFirst: function() {
      return this.step <= 1
    },
  },
  methods: {
    inc: function() {
      this.step += 1
    },
    dec: function() {
      this.step -= 1
    },
  },
}
</script>
