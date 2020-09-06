<template>
  <div id="load-input">
    <label for="inputfile">Choose an input file in json format</label>
    <input
      type="file"
      id="inputfile"
      name="inputfile"
      accept=".json"
      @change="onInputChange"
    />
  </div>
</template>

<script>
//TODO:multi step form like architectures should be done with vuex and vue-router!!!

//https://stackoverflow.com/questions/38616167/communication-between-sibling-components-in-vuejs-2-0/47004242#47004242
import { Duty, Soldier } from "./../lib/duties.js"
import store from "./../store/store.js"
export default {
  /*data: function() {
    return {
      duties: [],
      soldiers: [],
    }
  },*/
  methods: {
    onInputChange(event) {
      if (event.target.files.length !== 1) return
      const f = event.target.files[0]
      f.text()
        .then((text) => {
          const o = JSON.parse(text)
          store.duties = o.duties.map(
            (duty) => new Duty(duty.name, duty.numberOfSoldiersNeeded)
          )
          store.soldiers = o.soldiers.map(
            (soldier) => new Soldier(soldier.name, soldier.orderedPrefs)
          )
          store.selectedSoldiers = o.soldiers.map(() => false)
        })
        .catch((e) => {
          console.log("e :>> ", e)
          //
        })
    },
  },
}
</script>
