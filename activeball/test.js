// GLOBAL VARS
var fr = 60;
var stage;
var hue;
var bgHue;
var particles = [];
var particleCount;
var mousePos;
var explodeMag;

// PARTICLES
function Particle(x, y) {
	// Position & Motion
  this.pos = createVector(x, y);
  this.maxspeed = 1;		// Maximum speed
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, 0);
	this.size = random(5, 40);
  this.mass = this.size / 3;
	
	// Styling
  this.Hsl = hue + random(-160, -120);
  this.Hsl = correctRotation(this.Hsl);
  this.hSl = random(60, 100);
  this.hsL = random(90, 100);

	// Apply behaviors and forces
	this.applyBehaviors = function(vehicles) {
		var separateForce = this.separate(vehicles);
		this.applyForce(separateForce);
	}

	this.applyForce = function(force) {
    var f = force.copy();
    f.div(this.mass);
		this.acceleration.add(f);
	}

	// Update & Draw
	this.update = function() {
		this.velocity.add(this.acceleration);
		// this.velocity.limit(this.maxspeed);
		this.pos.add(this.velocity);
		this.acceleration.mult(0);
	}
	this.draw = function() {
		fill(this.Hsl, this.hSl, this.hsL);
		noStroke();
		ellipse(this.pos.x, this.pos.y, this.size, this.size);
	}
	
	// Behaviors & Edges
	this.explode = function(maxMag) {
		var myDistance = p5.Vector.dist(this.pos, mousePos);
		// The greater the distance the weaker the force
		var magnitude = 0 + maxMag/myDistance*2;
		var diff = p5.Vector.sub(this.pos, mousePos);
		diff.normalize();
		diff.mult(magnitude);		
		
		this.applyForce(diff);
	}
	
	this.separate = function(particles) {
		var desiredSeparation = 0;
		var sum = createVector(0,0); // create a vector that will sum the distance to all other particles.
    var count = 0; // Used to keep track of how many vectors are added to the sum
			// Compare to other particles
			for (var i = 0; i < particles.length; i++) {
				// Calculate my distance to another particle
				var myDistance = p5.Vector.dist(this.pos, particles[i].pos);
				var sizeDiff = (this.size + particles[i].size)/2;
				// Ignore: myself, and particles outside of desiredSeparation
				if ((myDistance > 0) && (myDistance < desiredSeparation + sizeDiff)) {
					// Reverse the direction / point away from other particle
					var diff = p5.Vector.sub(this.pos, particles[i].pos);
					diff.normalize();
					diff.div(myDistance);
					sum.add(diff);
					count++; //keep track to average later
				}				
			}
			// Average
			if (count > 0) {
				sum.div(count);
				sum.normalize(); // Normalize so we can apply our max speed
				sum.mult(this.maxspeed);
				// Implement Reynolds: Steering = Desired - Velocity
				sum.sub(this.velocity);
				sum.limit(this.maxforce);
			}
			return sum;
	}
	
  this.edges = function() {
		if (this.pos.y > height + this.size) {
      this.pos.y = 0 - this.size/2;
    } else if (this.pos.y < 0 - this.size) {
      this.pos.y = height+this.size/2;
    }
    if (this.pos.x > width + this.size) {
      this.pos.x = 0 - this.size;
    } else if (this.pos.x < 0 - this.size) {
      this.pos.x = width + this.size;
    }
	}
}

// INITIALIZE & DRAW
function setup() {
	window.addEventListener("resize", resize);
	explodeMag = width/2;
	// Create Stage
	stage = createVector(document.body.offsetWidth, document.body.offsetHeight); 
	createCanvas(stage.x, stage.y);
  frameRate(fr);
	// Set Background
	colorMode(HSB);
	hue = random(340, 300);
  bgHue = hue;
  bgHue = createVector(correctRotation(bgHue), 100, 80);
	background(bgHue.x, bgHue.y, bgHue.z);
	// Create Particles
	particleDensity = .2;
  particleCount = width*particleDensity;
  for (i = 0; i < particleCount; i++) {
      var x = random(width);
      var y = random(height);
	    particles[i] = new Particle(x, y);
	}
}

function draw() {
	background(bgHue.x, bgHue.y, bgHue.z);
	mousePos = createVector(mouseX, mouseY);
	// DRAW Particles
	for (i = 0; i < particleCount; i++) {
		particles[i].applyBehaviors(particles);
    particles[i].edges();
		particles[i].update();
		particles[i].draw();
	}
	
}



// MOUSE EVENTS
function mousePressed() {
  for (i = 0; i < particleCount; i++) {
		particles[i].explode(width);
	}	
}



// UTILITIES
function resize () {
	setup();
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function correctRotation(deg) {
/*
  Corrects a rotation and if it:
  exceed 360 degrees or is less than 0
*/
  if (deg > 360) { deg -= 360; } 
	else if(deg < 0) { deg += 360; } 
  return(deg);
}

