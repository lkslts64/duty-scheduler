import Vue from "vue"
import App from "./App.vue"

import SelectSoldiers from "./components/SelectSoldiers.vue"
import Input from "./components/Input.vue"
import Results from "./components/Results.vue"

//register components to be used at wizard
Vue.component("SelectSoldiers", SelectSoldiers)
Vue.component("Input", Input)
Vue.component("Results", Results)

Vue.config.productionTip = false

new Vue({
  render: (h) => h(App),
}).$mount("#app")
