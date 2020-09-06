class Soldier {
  constructor(name, orderedPrefs, seira = 0) {
    this.name = name
    //when he joined the army
    this.seira = seira
    //array containing the duty names ordered according to the soldier's preference
    this.orderedPrefs = orderedPrefs
    //if he has been assigned a duty
    this.available = true
  }

  canPerformDuty(dutyName) {
    return this.orderedPrefs.includes(dutyName)
  }
}

class Duty {
  constructor(name, numberOfSoldiersNeeded) {
    this.name = name
    this.numberOfSoldiersNeeded = numberOfSoldiersNeeded
    this.assignedSoldiers = []
  }

  isFilledWithSoldiers() {
    return this.assignedSoldiers.length === this.numberOfSoldiersNeeded
  }
}

//Scheduler is responsible for assigning the soldiers at duties.
//This is done through a weighted random process described in fillDutyWithSoldiers
//method. Because this ...
class Scheduler {
  constructor(soldiers, duties, randomness = 4) {
    this.soldiers = soldiers
    this.duties = duties
    //a number between [1,4] indicating how much random the weighted electing duty process
    //will be.
    this.randomness = randomness
  }

  //return the duty we should currently assign soldiers to.
  get nextDuty() {
    return this.duties.find((duty) => !duty.isFilledWithSoldiers())
  }

  get availableSoldiers() {
    return this.soldiers.filter((s) => s.available)
  }

  get unavaialbleSoldiers() {
    return this.soldiers.filter((s) => !s.available)
  }

  get availableDuties() {
    return this.duties.filter((duty) => !duty.isFilledWithSoldiers())
  }

  get unavailableDuties() {
    return this.duties.filter((duty) => duty.isFilledWithSoldiers())
  }

  //heal gets called when there aren't enough soldiers to be assigned to `this.nextDuty` due
  // to constraints (note: not all soldiers can be assigned at all duties- only these that exist in orderedPrefs
  //attribute of Soldier class). Heal tries to de-assign a soldier that has been already
  //assigned to a duty and can perform `this.nextDuty`, and assign at his position one of the
  //'nonUsefull' soldiers (i.e the ones that can't perform `this.nextDuty`). Heal function uses
  // BFS internally. By doing this, we end up with +1 soldier that can perform `this.nextDuty`.
  heal() {
    const nonUsefullSoldiers = this.availableSoldiers.filter(
      (soldier) => !soldier.canPerformDuty(this.nextDuty.name)
    )
    for (const s of nonUsefullSoldiers) {
      const res = this.bfs(s)
      if (res !== null) {
        s.available = false
        res.available = true
        return res
      }
    }
    return null
  }

  bfs(nonUsefullSoldier) {
    //when we find a suitable soldier we traceback
    const traceback = (node) => {
      const shift = (node) => {
        const curr = node
        const prev = node.prev
        if (prev === null) return null
        const { soldier: psoldier, duty: pduty } = prev
        const { soldier: csoldier, duty: cduty } = curr
        if (pduty) {
          const pi = pduty.assignedSoldiers.indexOf(psoldier)
          pduty.assignedSoldiers.splice(pi, 1)
        }
        const ci = cduty.assignedSoldiers.indexOf(csoldier)
        cduty.assignedSoldiers.splice(ci, 1)
        cduty.assignedSoldiers.push(psoldier)
        return prev
      }
      let n = node
      while (n !== null) {
        n = shift(n)
      }
    }
    //we enqueue soldiers but seen holds dutie names as keys. this is not a problem .There is a 1-1 relation between assigned duties and soldiers
    //assigned in them. 'seen' could hav also soldiers but it is more efficient and simple like this.
    const queue = []
    const seen = {}
    const wantedDuty = this.nextDuty
    const unavailableDuties = this.unavailableDuties
    queue.push({
      soldier: nonUsefullSoldier,
      prev: null,
      duty: null,
    })
    while (queue.length > 0) {
      const node = queue.shift()
      //console.log("node :>> ", node)
      const { soldier } = node
      if (soldier.orderedPrefs.indexOf(wantedDuty.name) >= 0) {
        traceback(node)
        return soldier
      }
      unavailableDuties
        .filter((duty) => soldier.orderedPrefs.indexOf(duty.name) >= 0)
        .filter((duty) => (seen[duty.name] === undefined ? true : false))
        //TODO: shuffle array to introduce randomness?
        .forEach((duty) => {
          seen[duty.name] = true
          queue.push(
            ...duty.assignedSoldiers.map((s) => {
              return {
                soldier: s,
                prev: node,
                duty: duty,
              }
            })
          )
        })
    }
    return null
  }

  fillDutyWithSoldiers() {
    const duty = this.nextDuty
    let electedSoldiers = []
    let assignableSoldiers = this.availableSoldiers.filter((soldier) =>
      soldier.canPerformDuty(duty.name)
    )
    //Each soldier has a certain propability to be elected for the duty. This propability is
    //based on how much the soldier prefers this duty (the more he prefers the higher the probability)
    //If we reach a situtation where we don't have any available soldiers for a particular duty
    //(note: not all soldiers can be assigned at all duties- only these that exist in orderedPrefs
    //attribute of Soldier class), then we will try reschedule some soldiers until we have as much
    //available soldiers as we need (heal function).
    if (assignableSoldiers.length < duty.numberOfSoldiersNeeded) {
      while (assignableSoldiers.length < duty.numberOfSoldiersNeeded) {
        const addedSoldier = this.heal()
        if (addedSoldier === null) {
          throw Error("Error. Can not schedule. Reached a dead end!")
        }
        assignableSoldiers.push(addedSoldier)
      }
      electedSoldiers = assignableSoldiers
    } else if (assignableSoldiers.length === duty.numberOfSoldiersNeeded) {
      electedSoldiers = assignableSoldiers
    } else {
      while (electedSoldiers.length < duty.numberOfSoldiersNeeded) {
        const electedIndex = this.electWeightedRandom(assignableSoldiers, duty)
        const elected = assignableSoldiers[electedIndex]
        electedSoldiers.push(elected)
        assignableSoldiers.splice(electedIndex, 1)
      }
    }
    //electedSoldiers now holds the soldiers to be assigned.
    electedSoldiers.forEach((s) => {
      s.available = false
    })
    duty.assignedSoldiers = electedSoldiers
  }

  electWeightedRandom(soldiers, duty) {
    let sum = 0
    const sumArr = soldiers.map((soldier) => {
      sum +=
        1 /
        (Math.pow(
          soldier.orderedPrefs.indexOf(duty.name),
          5 - this.randomness
        ) +
          1)
      return sum
    })

    const randNum = Math.random() * sumArr[sumArr.length - 1]
    return sumArr.findIndex((num) => randNum < num)
  }

  run() {
    const sz = this.availableDuties.length
    for (let i = 0; i < sz; i++) {
      this.fillDutyWithSoldiers()
    }
  }
}

/*function binarySearchVariant(ar, target) {
  var m = 0
  var n = ar.length - 1
  while (m <= n) {
    var k = (n + m) >> 1
    if (k > target) {
      m = k + 1
    } else if (k < target) {
      n = k - 1
    } else {
      return k
    }
  }
  //at the end we can have three cases:
  //1) half == end == start-1 , so start is the index we want
  //2) half == start == end+1, so start is the index we want
  //3) half == start == end+1 == 0 so start+1 is the index we want
  if (m === 0) {
    return m + 1
  }
  return m
}*/

module.exports.Scheduler = Scheduler
module.exports.Soldier = Soldier
module.exports.Duty = Duty
