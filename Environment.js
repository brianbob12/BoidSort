class Environment {
  /**
   * 
   * @param {{height:number,width:number,simulationRate:number,boidDetectionDistance:number}} settings 
   */
  constructor(settings) {
    this.settings = settings
    this.cellSize = settings.boidDetectionDistance
    this.cellsX = ceil(settings.width / settings.boidDetectionDistance)
    this.cellsY = ceil(settings.height / settings.boidDetectionDistance)

    this.boids = []
    this.cells = []

    this.clear()
  }

  /**
   * Resets the environment and removes all boids
   */
  clear() {
    this.boids = []
    this.cells = new Array(this.cellsY)

    for (var i = 0; i < this.cellsY; i++) {
      this.cells[i] = new Array(this.cellsX)
      for (var j = 0; j < this.cellsX; j++) {
        this.cells[i][j] = []
      }
    }
  }

  /**
   * Returns the cell of a pos
   * @param {p5.Vector} pos
   * 
   * @returns {{x:number,y:number}} cellIndex
   */
  getCell(pos) {
    return {
      x: floor(pos.x / this.cellSize),
      y: floor(pos.y / this.cellSize),
    }
  }

  getNeighborhoodCells(cellIndex) {
    const cellNeighborhood = 1;
    let neighboringCells = []
    for (var i = - cellNeighborhood; i <= cellNeighborhood; i++) {
      for (var j = - cellNeighborhood; j <= cellNeighborhood; j++) {
        var x = cellIndex.x + i
        var y = cellIndex.y + j
        if (x >= this.cellsX || x < 0 || y >= this.cellsY || y < 0) {
          continue
        }
        neighboringCells.push({ x, y })
      }
    }
    return neighboringCells
  }

  getBoidsIn(cellIndex) {
    return this.cells[cellIndex.y][cellIndex.x]
  }
  addBoidToCell(boid, cellIndex) {
    if (cellIndex.x > this.cellsX || cellIndex.x < 0 || cellIndex.y > this.cellsY || cellIndex.y < 0) {
      console.log(`Invalid cellIndex: ${cellIndex.x}, ${cellIndex.y}`)
      return
    }
    this.cells[cellIndex.y][cellIndex.x].push(boid)
  }
  removeBoidFromCell(boid, cellIndex) {
    this.cells[cellIndex.y][cellIndex.x] = this.cells[cellIndex.y][cellIndex.x].filter(
      (otherBoid) => boid.eq(otherBoid)
    )
  }

  /**
   * returns the boids in the detection distance of a boid, excluding itself
   * 
   * @param {Boid} boid
   * 
   * @returns {Boid[]} neighbors
   */
  getNeighbors(boid) {
    const neighbors = []

    const cellNeighborhood = this.getNeighborhoodCells(this.getCell(boid.pos))

    cellNeighborhood.forEach(cell => {
      this.getBoidsIn(cell).forEach(neighbor => {
        if (boid.eq(neighbor)) {
          return
        }
        if (p5.Vector.dist(boid.pos, neighbor.pos) > this.settings.boidDetectionDistance) {
          return
        }
        neighbors.push(neighbor)
      });
    })
    return neighbors
  }

  advance(deltaT) {
    this.boids.forEach((boid) => {
      const previousCell = this.getCell(boid.pos)
      boid.advance(
        deltaT * this.settings.simulationRate,
        this.getNeighbors(boid),
        this.settings.width,
        this.settings.height
      )
      const newCell = this.getCell(boid.pos)
      if (previousCell.x != newCell.x || previousCell.y != newCell.y) {
        this.removeBoidFromCell(boid, previousCell)
        this.addBoidToCell(boid, newCell)
      }
    })
  }

  addBoid(boid) {
    this.boids.push(boid)
    const cell = this.getCell(boid.pos)
    this.addBoidToCell(boid, cell)
  }

  getRandomInBoundsPos() {
    return createVector(random() * this.settings.width, random() * this.settings.height)
  }
}