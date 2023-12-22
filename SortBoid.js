class SortBoid {
  /**
   * 
   * @param {comparable} num the number of this boid for sorting
   * @param {p5.Vector} startPos 
   * @param {} context 
   */
  constructor(num, startPos, context) {
    this.ID = floor(random() * (2 ** 32))

    this.num = num
    this.context = context

    this.pos = startPos
    this.velocity = p5.Vector.mult(p5.Vector.normalize(createVector(random() * 2 - 1, random() * 2 - 1)), context.attackSpeed)

    this.following = null

    //not used
    this.lookAhead = 1.1

    this.drawNeighborhood = true
  }

  applyVelocity(deltaT) {
    const velocityCopy = this.velocity.copy()
    velocityCopy.mult(deltaT)
    this.pos.add(velocityCopy)
  }

  mapPos(maxX, maxY) {
    if (this.pos.x > maxX) {
      this.pos.x -= maxX
    }
    else if (this.pos.x < 0) {
      this.pos.x += maxX
    }
    if (this.pos.y > maxY) {
      this.pos.y -= maxY
    }
    else if (this.pos.y < 0) {
      this.pos.y += maxY
    }
  }

  eq(boid) {
    return this.ID == boid.ID
  }

  vectorTowards(vec) {
    return p5.Vector.sub(vec, this.pos).normalize()
  }

  distanceTo(vec) {
    return p5.Vector.sub(vec, this.pos).mag()
  }

  turnTo(vec, deltaT) {
    const turnAuthority = this.context.turnSpeed * deltaT

    const angleBetween = p5.Vector.angleBetween(this.velocity, vec)
    if (abs(angleBetween) < turnAuthority) {
      this.velocity.setHeading(vec.heading())
    }
    else {
      const sign = angleBetween > 0 ? 1 : -1
      this.velocity.rotate(turnAuthority * sign)
    }
  }

  advance(deltaT, neighbors, maxX, maxY) {
    if (this.drawNeighborhood) {
      neighbors.forEach((neighbor) => {
        stroke(0, 255, 0)
        line(this.pos.x, this.pos.y, neighbor.pos.x, neighbor.pos.y)
      })
    }

    /*
    if (this.following && this.distanceTo(this.following.pos) > this.context.boidDetectionDistance) {
      this.following = null
    }
    */

    neighbors.forEach(neighbor => {
      if (!this.following) {
        if (neighbor.num > this.num) {
          this.following = neighbor
        }
        return
      }
      if (neighbor.num > this.num && neighbor.num < this.following.num) {
        this.following = neighbor
      }
    })

    if (this.following) {
      const targetPos = this.following.pos.copy()
      //const targetVelocity = this.following.velocity.copy()
      //const targetPoint = targetPos.add(targetVelocity.mult(this.lookAhead))
      const targetPoint = targetPos
      this.turnTo(targetPoint.sub(this.pos), deltaT)

      this.velocity.normalize()
      const dist = this.distanceTo(this.following.pos)
      if (dist > this.context.followDistance + this.context.buffer / 2) {
        this.velocity.mult(this.context.attackSpeed * deltaT)
      }
      else if (dist < this.context.followDistance - this.context.buffer / 2) {
        this.velocity.mult(this.context.fallbackSpeed * deltaT)
      }
      else {
        this.velocity.mult(this.context.cruiseSpeed * deltaT)
      }
    }
    else {
      this.velocity.normalize().mult(this.context.cruiseSpeed * deltaT)

      const wallLeft = this.pos.x < this.context.boidDetectionDistance / 2
      const wallRight = this.pos.x > maxX - this.context.boidDetectionDistance / 2
      const wallTop = this.pos.y < this.context.boidDetectionDistance / 2
      const wallBottom = this.pos.y > maxY - this.context.boidDetectionDistance / 2
      //check if we're about to run into a wall
      if (wallLeft || wallRight || wallTop || wallBottom) {
        let turnX = 0;
        if (wallLeft) { turnX = 1 }
        if (wallRight) { turnX = -1 }
        let turnY = 0;
        if (wallTop) { turnY = 1 }
        if (wallBottom) { turnY = -1 }
        this.turnTo(createVector(turnX, turnY), deltaT)
      }
      else {
        this.turnTo(createVector(random() * 2 - 1, random() * 2 - 1), deltaT * 0.5)
      }
    }

    this.applyVelocity(deltaT)
    this.mapPos(maxX, maxY)
  }
}