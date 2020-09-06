<template>
  <div>
    <div v-for="duty in scheduledDuties" :key="duty.name">
      <div v-for="(s, i) in duty.assignedSoldiers" :key="s.name">
        {{ s.name + " -> " + duty.name + " (" + i.toString() + ")" }}
      </div>
    </div>
  </div>
</template>

<script>
import store from "./../store/store.js"
import { Scheduler } from "./../lib/duties.js"

export default {
  data: function() {
    return {
      active: Boolean,
    }
  },
  activated: function() {
    this.active = true
  },
  deactivated: function() {
    this.active = false
  },
  computed: {
    scheduledDuties: function() {
      //there is no need to re-evaluate this compononet is not active
      if (!this.active) return store.duties
      //clear first
      store.duties.forEach((d) => {
        d.assignedSoldiers = []
      })
      store.soldiers.forEach((s) => {
        s.available = true
      })

      /*if (soldiersNeeded !== store.soldiers.length) {
        this.err =
          "Please make sure that the number of soldiers that you have selected is exactly equal to the number of duties"
      }*/
      const sched = new Scheduler(
        store.soldiers.filter((s, i) => store.selectedSoldiers[i]),
        store.duties
      )
      try {
        sched.run()
        return store.duties
      } catch (e) {
        console.log("e :>> ", e)
        return []
      }
    },
  },
  //methods: {},
}
</script>
