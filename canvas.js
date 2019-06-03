const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext("2d");

// Variables
const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2
};

// Utilities
const randomIntFromRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomColor = () => {
  const colorNumbers = [];
  while (colorNumbers.length < 3) {
    colorNumbers.push(Math.floor(Math.random() * 255));
  }

  return `rgb(${colorNumbers[0]}, ${colorNumbers[1]}, ${colorNumbers[2]})`;
};

const rotate = (velocity, angle) => {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
};

const resolveCollision = (particle, otherParticle) => {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
};

window.addEventListener("mousemove", e => {
  mouse.x = e.screenX;
  mouse.y = e.screenY;
});

const getDistance = (x1, y1, x2, y2) => {
  const xDistance = x2 - x1;
  const yDistance = y2 - y1;

  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
};

// Ball creator
class Ball {
  constructor(x, y, radius, color, mass) {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: randomIntFromRange(-2.5, 2.5),
      y: randomIntFromRange(-2.5, 2.5)
    };
    this.radius = radius;
    this.color = color;
    this.mass = mass;
  }

  update = function(balls) {
    this.draw();

    for (let i = 0; i < balls.length; i++) {
      if (this === balls[i]) continue;

      const distance = getDistance(this.x, this.y, balls[i].x, balls[i].y);

      if (distance - (this.radius + balls[i].radius) < 0) {
        resolveCollision(this, balls[i]);
      }
    }
  };

  draw = function() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();

    if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
      this.velocity.x = -this.velocity.x;
    }

    if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
      this.velocity.y = -this.velocity.y;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  };
}

// Implementation
const balls = [];

function init() {
  while (balls.length < 100) {
    const radius = randomIntFromRange(10, 30);
    let x = randomIntFromRange(radius * 2, innerWidth - radius * 2);
    let y = randomIntFromRange(radius * 2, innerHeight - radius * 2);
    const mass = 1;

    if (balls.length > 1) {
      for (let i = 0; i < balls.length; i++) {
        const distance = getDistance(x, y, balls[i].x, balls[i].y);

        if (distance - (radius + balls[i].radius) < 0) {
          x = randomIntFromRange(radius * 2, innerWidth - radius * 2);
          y = randomIntFromRange(radius * 2, innerHeight - radius * 2);

          i = -1;
        }
      }
    }

    balls.push(new Ball(x, y, radius, randomColor(), mass));
  }
}

// Animation loop

const animate = () => {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, innerWidth, innerHeight);

  balls.forEach(ball => {
    ball.update(balls);
  });
};

init();
animate();
