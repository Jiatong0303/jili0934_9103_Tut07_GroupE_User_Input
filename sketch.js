const BASE_SIZE = 900;
let scaleFactor;
let offsetX, offsetY;

let blobs = [];
let radiants = [];
let holes = [];
let sparks = [];
let bgTexture;

//User Input_Mouse Ripple
let circleX;
let circleY;
let circleSize = 0;

function calculateScale() {
  // scale to screen
  scaleFactor = max(windowWidth / BASE_SIZE, windowHeight / BASE_SIZE);
  offsetX = (windowWidth - BASE_SIZE * scaleFactor) / 2;
  offsetY = (windowHeight - BASE_SIZE * scaleFactor) / 2;
}

function setup() {
  calculateScale();
  createCanvas(windowWidth, windowHeight);
  noStroke();

  //User Input_Mouse Ripple
  circleX = width / 2;
  circleY = height / 2;

  // Create background texture
  bgTexture = createGraphics(windowWidth, windowHeight);
  createTexture(bgTexture);

  // initialize objects
  for (let i = 0; i < 100; i++) blobs.push(new NoiseBlob());
  for (let i = 0; i < 25; i++) radiants.push(new Radiant());
  for (let i = 0; i < 20; i++) holes.push(new Hole());
  for (let i = 0; i < 50; i++) sparks.push(new Spark());
}

function draw() {
  // Show Background Texture
  image(bgTexture, offsetX, offsetY, BASE_SIZE * scaleFactor, BASE_SIZE * scaleFactor);
  
  // Softer effect
  fill(0, 25);
  rect(0, 0, windowWidth, windowHeight);

  push();
  translate(offsetX, offsetY);
  scale(scaleFactor);
  for (let h of holes) h.show();
  for (let b of blobs) {
    b.update();
    b.show();
  }
  for (let r of radiants) {
    r.update();
    r.show();
  }
  for (let s of sparks) {
    s.update();
    s.show();
  }
  pop();

  //User Input_Mouse Ripple
  circleSize += 10;

  push();
  noFill();
  strokeWeight(2);
  stroke(255, 240, 180, 150); //(r, g, b, alpha (transparency))
  circle(circleX, circleY, circleSize); //Ripple_1
  circle(circleX, circleY, circleSize * 0.75); //Ripple_2
  circle(circleX, circleY, circleSize * 0.5); //Ripple_3
  circle(circleX, circleY, circleSize * 0.25); //Ripple_4
  pop(); 
  //9103 Week 10 Tutorial module
}

function windowResized() {
  calculateScale();
  resizeCanvas(windowWidth, windowHeight);
}

// Create background texture function
function createTexture(g) {
  g.background(0);
  g.noStroke();
  for (let i = 0; i < 10000; i++) {
    let x = random(g.width), y = random(g.height);
    let s = random(0.5, 2), a = random(5, 15);
    g.fill(30, 20, 40, a);
    g.ellipse(x, y, s);
  }
  g.stroke(40, 30, 50, 10);
  for (let i = 0; i < 50; i++) {
    let x1 = random(g.width), y1 = random(g.height);
    let x2 = x1 + random(-100, 100), y2 = y1 + random(-100, 100);
    g.line(x1, y1, x2, y2);
  }
}

// class NoiseBlob
class NoiseBlob {
    constructor() {
      this.x = random(BASE_SIZE);
      this.y = random(BASE_SIZE);
      // base radius and properties
      this.rBase = random(20, 120) / 1.5;
      this.alpha = random(30, 120);
      this.phase = random(TWO_PI);
      this.speed = random(0.01, 0.02);
      this.baseColor = color(
        255 + random(-30, 0),
        180 + random(-30, 30),
        120 + random(-50, 50),
        this.alpha
      );
      this.c = this.baseColor;
      this.depth = random(1);
      this.noiseScale = random(0.02, 0.05);
      this.r = this.rBase;
    }

  update() {
    this.phase += this.speed;
    this.r = this.rBase + sin(this.phase) * (15 * this.depth); 
    // Slow noise displacement
    this.x += map(noise(frameCount * this.noiseScale, 0), -1, 1, -0.3, 0.3);
    this.y += map(noise(0, frameCount * this.noiseScale), -1, 1, -0.3, 0.3);
    
    if (this.x < 0) this.x = BASE_SIZE;
    if (this.x > BASE_SIZE) this.x = 0;
    if (this.y < 0) this.y = BASE_SIZE;
    if (this.y > BASE_SIZE) this.y = 0;
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Adjust transparency and blending modes
    if (this.depth > 0.7) {
      drawingContext.globalCompositeOperation = 'lighter';
    }
    
    // Lighting part
    fill(this.c);
    ellipse(0, 0, this.r);
    
    // Adding glow effect
    let glowSize = this.r * 1.5;
    for (let i = 0; i < 3; i++) {
      fill(red(this.c), green(this.c), blue(this.c), this.alpha * 0.3 / (i+1));
      ellipse(0, 0, glowSize * (0.7 + i * 0.3));
    }
    
    // Adding inside texture
    noFill();
    stroke(255, this.alpha * 0.5);
    strokeWeight(0.5);
    for (let i = 0; i < 5; i++) {
      let r = this.r * (0.3 + i * 0.1);
      ellipse(0, 0, r);
    }
    
    pop();
  }
}

// class Radiant
class Radiant {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.r = random(20, 60);
    this.n = int(random(30, 120));
    this.alpha = random(30, 100);  
    this.angle = random(TWO_PI);
    this.rotSpeed = random(0.001, 0.03);
    this.lineLength = random(20, 60);
    this.depth = random(1);
    this.pulseSpeed = random(0.05, 0.08);
    this.pulsePhase = random(TWO_PI);
    this.currentLength = this.lineLength;
    this.centerSize = this.r * 0.6;
  }

  update() {
    this.angle += this.rotSpeed * map(this.depth, 0, 1, 0.8, 1.2);
    this.pulsePhase += this.pulseSpeed;
    this.currentLength = this.lineLength * (0.8 + sin(this.pulsePhase) * 0.2);
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Adjust the appearance
    let strokeAlpha = this.alpha * map(this.depth, 0, 1, 0.7, 1);
    stroke(255, 240, 180, strokeAlpha);
    strokeWeight(map(this.depth, 0, 1, 0.3, 0.8));
    
    for (let i = 0; i < this.n; i++) {
      let a = TWO_PI * i / this.n;
      let x1 = cos(a) * this.r;
      let y1 = sin(a) * this.r;
      let x2 = cos(a) * (this.r + this.currentLength);
      let y2 = sin(a) * (this.r + this.currentLength);
      
      // Make lines brighter
      if (i % 5 === 0) {
        stroke(255, 255, 200, strokeAlpha * 1.5);
        strokeWeight(map(this.depth, 0, 1, 0.5, 1.2));
      } else {
        stroke(255, 240, 180, strokeAlpha);
        strokeWeight(map(this.depth, 0, 1, 0.3, 0.8));
      }
      
      line(x1, y1, x2, y2);
    }
    
    // Adding center light
    fill(255, 240, 180, strokeAlpha * 0.5);
    noStroke();
    ellipse(0, 0, this.r * 0.5);
    
    pop();
  }
}

// Create holes
class Hole {
    constructor() {
      this.x = random(width);
      this.y = random(height);
      this.r = random(5, 12);
      this.depth = random(1);
      this.innerR = this.r * random(0.3, 0.7);
      this.innerColor = color(
        20 + random(-10, 10),
        10 + random(-5, 5),
        30 + random(-10, 10)
      );
    }
  
    show() {
      push();
      translate(this.x, this.y);
      noStroke();
      fill(0);
      ellipse(0, 0, this.r * 2);
      fill(this.innerColor);
      ellipse(0, 0, this.innerR * 2);
      fill(60, 50, 80, 100);
      ellipse(this.r * 0.2, -this.r * 0.2, this.r * 0.3);
      pop();
    }
  }

// Create sparks
class Spark {
  constructor() {
    this.reset();
    this.life = random(80, 400);
    this.age = random(this.life);
    this.type = random() > 0.7 ? "line" : "dot";
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-1.5, 1.5);
    this.vy = random(-1.5, 1.5);
    this.size = random(1, 4);
    this.baseAlpha = random(100, 255);
    this.colorVariation = random(100);
    this.life = random(80, 400);
    this.age = 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (this.age > this.life || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.reset();
    }
  }

  show() {
    let alpha = this.baseAlpha * (0.5 + 0.5 * sin(this.age * 0.05));
    if (this.type === "line") {
      let angle = noise(this.x * 0.01, this.y * 0.01) * TWO_PI;
      let len = this.size * 3;
      stroke(255 - this.colorVariation, 215 - this.colorVariation * 0.5, 130 + this.colorVariation * 0.3, alpha);
      strokeWeight(this.size * 0.5);
      line(this.x, this.y, this.x + cos(angle) * len, this.y + sin(angle) * len);
    } else {
      noStroke();
      fill(255 - this.colorVariation, 215 - this.colorVariation * 0.5, 130 + this.colorVariation * 0.3, alpha);
      ellipse(this.x, this.y, this.size);
      fill(255 - this.colorVariation, 215 - this.colorVariation * 0.5, 130 + this.colorVariation * 0.3, alpha * 0.3);
      ellipse(this.x, this.y, this.size * 3);
    }
  }
}
//End of group artwork code

//Start of User Input
//Mouse pressed to change a random colour for each blob
//P5.js (n.d.). mousePressed(). https://p5js.org/reference/p5/mousePressed/ 
function mousePressed() {
  for (let b of blobs) {
  //Change a random colour for each blob
  b.c = color(
    random(100, 255), //Random value between 100 to 255
    random(100, 255),
    random(100, 255),
    b.alpha //The transparency of the blobs will not change along each press
  );
  }

  //User Input_Mouse Ripple
  //The position of the ripple
  circleX = mouseX;
  circleY = mouseY;
  circleSize = 0;
}
//Mouse ripple code from Happy Coding: 
//Happy Coding. (n.d.). Mouse Ripple. https://happycoding.io/tutorials/p5js/input/mouse-ripple

//Add function keyPressed
//9103 Week 6 Tutorial module
function keyPressed(){
  if (keyCode === UP_ARROW) {
    for (let b of blobs) {
      b.rBase += 5;
      //(every time the user presses the up arrow)
      //The blobs will increase their size based on their radius base size
      b.rBase = constrain(b.rBase, 10, 200); 
      //Constrain the blob radius to stay within the range of minimum (10) to maximum (200)
      //To avoid blobs become too small or too large.
    }
  }

  if (keyCode === DOWN_ARROW) {
    for (let b of blobs) {
      b.rBase -= 5;
      //(every time the user presses the down arrow)
      //The blobs will reduce their size based on their radius base size
      b.rBase = constrain(b.rBase, 10, 200);
      //Constrain the blob radius to stay within the range of minimum (10) to maximum (200)
      //To avoid blobs become too small or too large.
    }
  }
}