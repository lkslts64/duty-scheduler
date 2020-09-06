<template>
  <div>
    <div v-for="(s, index) in soldiers" :key="index">
      <label for="s.name"> {{ s.name }} </label>
      <input
        type="checkbox"
        :id="index"
        :value="s.name"
        @change="onCheckboxChange($event)"
        v-model="selectedNames"
      />
    </div>
    <br />
    <div>
      <button @click="selectAll">Select all</button>
      <button @click="deselectAll">Deselect all</button>
      {{ "Soldiers needed : " + soldiersNeeded.toString() }}
      {{ "Soldiers selected : " + soldiersSelected.toString() }}
    </div>
  </div>
</template>

<script>
//TODO: avoid duplication with selectedNames and store.selectedSoldiers
import store from "./../store/store.js"
import Vue from "vue"

export default {
  data: function() {
    return {
      selectedNames: [],
    }
  },
  computed: {
    soldiers: function() {
      return store.soldiers
    },
    soldiersNeeded: function() {
      return store.duties.reduce(
        (totalSoldiersNeeded, curr) =>
          totalSoldiersNeeded + curr.numberOfSoldiersNeeded,
        0
      )
    },
    soldiersSelected: function() {
      return this.selectedNames.length
    },
    selectedStored: function() {
      return store.selectedSoldiers
    },
  },

  methods: {
    onCheckboxChange: function(e) {
      Vue.set(store.selectedSoldiers, e.target.id, e.target.checked)
    },
    selectAll: function() {
      this.selectedNames = store.soldiers.map((s) => s.name)
      store.selectedSoldiers = store.selectedSoldiers.map(() => true)
    },
    deselectAll: function() {
      this.selectedNames = []
      store.selectedSoldiers = store.selectedSoldiers.map(() => false)
    },
  },
}
</script>
