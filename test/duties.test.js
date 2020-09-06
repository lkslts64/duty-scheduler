const { Scheduler, Soldier, Duty } = require("./../src/lib/duties.js")
const fs = require("fs")

describe("test random election", () => {
  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.8)
  })

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore()
  })

  test("test sum", () => {
    const soldiers = [
      new Soldier("A", ["1", "2", "3"]),
      new Soldier("B", ["1", "2", "3"]),
      new Soldier("C", ["1", "2", "3"]),
    ]
    const duty = new Duty("2", 1)
    const sched = new Scheduler(soldiers, [duty])
    expect(sched.electWeightedRandom(soldiers, duty)).toBe(2)
  })
})

describe("test heal", () => {
  const assign = (soldiers, duties, soldIndex, dutyIndex) => {
    duties[dutyIndex].assignedSoldiers.push(soldiers[soldIndex])
    soldiers[soldIndex].available = false
  }
  test("easy case", () => {
    const soldiers = [
      new Soldier("Loukas", ["1"]),
      new Soldier("Chara", ["1", "2"]),
    ]
    const duties = [new Duty("1", 1), new Duty("2", 1)]
    //assign Chara to duty '1'.
    assign(soldiers, duties, 1, 0)
    const sched = new Scheduler(soldiers, duties)
    //expect Loukas to be assigned to duty 1 and Chara to be
    //available again.
    const revealedSoldier = sched.heal()
    expect(duties[0].assignedSoldiers[0].name).toBe("Loukas")
    expect(revealedSoldier.name).toBe("Chara")
  })

  test("medium case", () => {
    const soldiers = [
      new Soldier("Loukas", ["1"]),
      new Soldier("Chara", ["1", "2"]),
      new Soldier("Sofia", ["2", "3"]),
    ]
    const duties = [new Duty("1", 1), new Duty("2", 1), new Duty("3", 1)]
    //assign Chara to duty '1'.
    assign(soldiers, duties, 1, 0)
    //assign Sofia to duty '2'.
    assign(soldiers, duties, 2, 1)

    const sched = new Scheduler(soldiers, duties)
    const revealedSoldier = sched.heal()
    expect(duties[0].assignedSoldiers[0].name).toBe("Loukas")
    expect(duties[1].assignedSoldiers[0].name).toBe("Chara")
    expect(revealedSoldier.name).toBe("Sofia")
  })
})

describe("test scheduler", () => {
  test.each([
    [
      "easy",
      [
        new Soldier("Loukas", ["1"]),
        new Soldier("Sofia", ["2"]),
        new Soldier("Chara", ["3"]),
      ],
      [new Duty("1", 1), new Duty("2", 1), new Duty("3", 1)],
    ],
    [
      "hard",
      [
        new Soldier("Loukas", ["1", "2"]),
        new Soldier("Sofia", ["2", "3"]),
        new Soldier("Chara", ["3", "1"]),
        new Soldier("Loukas2", ["1", "2"]),
        new Soldier("Sofia2", ["2", "3"]),
        new Soldier("Chara2", ["3", "1"]),
      ],
      [new Duty("1", 2), new Duty("2", 2), new Duty("3", 2)],
    ],
    [
      "medium",
      [
        new Soldier("Loukas", ["1", "2"]),
        new Soldier("Sofia", ["2", "3"]),
        new Soldier("Chara", ["3", "1"]),
      ],
      [new Duty("1", 1), new Duty("2", 1), new Duty("3", 1)],
    ],
  ])("sched run (%s)", (difficulty, soldiers, duties) => {
    const sched = new Scheduler(soldiers, duties)
    //expect(soldiers.length).toBe(duties.length)
    sched.run()
    sched.duties.forEach((duty) => {
      //console.log("omg :>> ", duty.assignedSoldiers)
      expect(duty.assignedSoldiers.length).toBe(duty.numberOfSoldiersNeeded)
      duty.assignedSoldiers.forEach((s) => {
        expect(s instanceof Soldier).toBeTruthy()
      })
    })
    //console.log("omg :>> ", sched.duties.assignedSoldiers)
    sched.soldiers.forEach((s) => {
      expect(s.available).toBe(false)
    })
  })

  test("unique solution due to constraints", () => {
    const soldiers = [
      new Soldier("Loukas", ["1"]),
      new Soldier("Sofia", ["1", "2"]),
      new Soldier("Chara", ["1", "2", "3"]),
      new Soldier("Evgenia", ["1", "2", "3", "4"]),
      new Soldier("Eva", ["1", "2", "3", "4", "5"]),
      new Soldier("Eleni", ["1", "2", "3", "4", "5", "6"]),
    ]
    const duties = [
      new Duty("1", 1),
      new Duty("2", 1),
      new Duty("3", 1),
      new Duty("4", 1),
      new Duty("5", 1),
      new Duty("6", 1),
    ]
    const sched = new Scheduler(soldiers, duties)
    sched.run()
    duties.forEach((d, index) => {
      expect(d.assignedSoldiers[0].name).toBe(soldiers[index].name)
    })
  })

  const createData = (numDuties) => {
    const duties = []
    let c = 0
    let i = 0
    while (c < numDuties) {
      const rSoldiersNeeded = Math.min(
        Math.round(Math.random() * 8) + 1,
        numDuties - c
      )
      c += rSoldiersNeeded
      i += 1
      duties.push(new Duty(i.toString(), rSoldiersNeeded))
    }

    const soldiers = [...Array(numDuties)]
    const dutyNames = duties.map((d) => d.name)
    for (let i = 0; i < numDuties; i++) {
      soldiers[i] = new Soldier(
        "Loukas" + i.toString(),
        shuffleArray([...dutyNames])
      )
    }
    return { soldiers, duties }
  }

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  const prunePrefs = (soldiers, duties, pruneMethod = "liveOne") => {
    const PrefsToPrune = Math.floor(Math.random() * duties.length)
    const sduties = shuffleArray([...duties]).slice(0, PrefsToPrune)
    shuffleArray(soldiers)

    let i = 0
    sduties.forEach((duty) => {
      const SoldiersToPrune = Math.floor(
        Math.random() * duty.numberOfSoldiersNeeded + 1
      )
      for (let j = 0; j < SoldiersToPrune; j++) {
        if (pruneMethod === "liveOne") {
          soldiers[i + j].orderedPrefs = [duty.name]
        } else if (pruneMethod === "liveHalf") {
          //TODO:implement??
        }
      }
      i += SoldiersToPrune
    })
  }

  test("random dataset", () => {
    /*const { soldiers, duties } = createData(50)
    const sched = new Scheduler(soldiers, duties)
    sched.run()
    duties.forEach((d) => {
      console.log(
        "slots",
        d.numberOfSoldiersNeeded,
        "assigned",
        d.assignedSoldiers.map((s) => s.name)
      )
    })*/
  })

  const randomDatasets = (nduties, nexecution, pruneMethod = "liveOne") => {
    for (let i = 0; i < nexecution; i++) {
      const { soldiers, duties } = createData(nduties)
      prunePrefs(soldiers, duties, pruneMethod)
      const sched = new Scheduler(soldiers, duties)
      expect(sched.run).not.toThrow(
        "Error. Can not schedule. Reached a dead end!"
      )
    }
  }
  test("repeated random datasets", () => {
    randomDatasets(100, 100)
    //randomDatasets(100, 100, "liveHalf")
    randomDatasets(1000, 2)
    const duties = []
    for (let i = 1; i < 14; i++) {
      if (i === 4 || i === 5 || i === 10) {
        continue
      }
      duties.push({
        name: i.toString(),
        numberOfSoldiersNeeded: 4,
      })
    }
    duties.push({
      name: "Dog",
      numberOfSoldiersNeeded: 3,
    })
    duties.push({
      name: "Watcher",
      numberOfSoldiersNeeded: 6,
    })
    duties.push({
      name: "Dekaneas",
      numberOfSoldiersNeeded: 2,
    })
    const dnames = duties.map((d) => d.name)
    const soldiers = []
    for (let i = 0; i < 51; i++) {
      soldiers.push({
        name: "STR Loukas" + i.toString(),
        orderedPrefs: shuffleArray([...dnames]),
      })
    }
    //prunePrefs(soldiers, duties)
    //const sched = new Scheduler(soldiers, duties)
    fs.writeFileSync(
      "input.json",
      JSON.stringify({ duties, soldiers }, null, 1)
    )
  })
})
