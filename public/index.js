// There is a Clock at the Heart of the Universe
// (Although it's probably just flashing 12:00 forever...)
// February 2022 Mandy Brigwell

let randomSeedValue = ~~(fxrand()*12345);
let noiseSeedValue = ~~(fxrand()*56789);
let screenSize;

var mainGraphics, clockGraphics, overlayGraphics, finishedRender;
var fullRes = 2048;

// Four possible rotations for the noise layer
var overlayGraphicsRotation = ~~(fxrand()*4);
var overlayModeSquare = (fxrand()*fxrand() > 0.4);

// The main piece has a focal point at 0, 0.
// This sets an offset, weighted towards the centre
var offsetX = (fxrand()*fullRes*0.3)-(fxrand()*fullRes*0.3);
var offsetY = (fxrand()*fullRes*0.3)-(fxrand()*fullRes*0.3);

// The render takes place over a limited number of frames
var maxFrames = 128+~~(fxrand()*fxrand()*256);

// Select a light background hue from weighted possibilities.
// "Did I ever tell you that blue was my favourite colour?"—Sutter Cane
var backgroundHues = [0, 60, 60, 120, 120, 180, 180, 240, 240, 240, 300, 300];
var selectedHue = ~~(fxrand()*backgroundHues.length);
var backgroundHue = backgroundHues[selectedHue]+~~(fxrand()*60);
var paletteDescriptions = ["red", "yellow", "yellow", "green", "green", "cyan", "cyan", "blue", "blue", "blue", "magenta", "magenta"];
var paletteDescription = paletteDescriptions[selectedHue];

// There are a number of render modes. They are weighted.
var renderModes = [0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 6];
var renderMode = renderModes[~~(fxrand()*renderModes.length)];
var renderModeDescriptions = ["short dark lines directed outward from the central focus, with the possible inclusion of white circles forming concentric striations towards the middle of the canvas", "dark-outlined circles, filled with translucent white, fading both towards the edges of the canvas and as rendering progresses", "delicately-outlined rectangles with a white fill, fading as rendering progresses", "light circles, overlaid with a slightly-darker outline", "coloured rectangles, with stroke increasing as rendering progresses", "a crosshatch of delicate white and dark strokes, intersecting at the centre", "slightly-rotated rectangles, with a directional stroke following the rotation of the render"];
var shortRenderModeDescriptions = ["Short dark lines ", "Dark-outlined circles", "Delicately-outlined rectangles", "Light circles", "Coloured rectangles", "A crosshatch of delicate strokes", "A directional stroke"];

// Flags for information overlay
var showInfo = true;
var showInfoInteracted = false;

// Secret clock mode variables
var clockAlpha = 1;
var clockAlphaTarget = 1;
var clockDistances = [-128, 32, 64, 64, 128, 128, 128, 256, 256, 512];
var clockDistance = clockDistances[~~(fxrand()*clockDistances.length)];

// Mainly for testing: defaults to fade in the image while rendering takes place
var dimWhileRendering = false;

// Constant rotation offset for main rotation
var rotationOffset = fxrand()*Math.PI*2;

// Each large rotation is then rotated by TAU/smallrotation
var smallRotation = ~~(fxrand()*32);

// Renderquotes, for quirky render fun
var renderQuotes = ["The alternatives are clear...", "...and in that moment, the new century was born.", "...a mere clockwork wonder, swinging in a vast vacuum...", "Believe nothing that you hear...", "...but there's nothing there, not even a beat.", "Chaos gave way to a clockwork world...", "The door that wakes in darkness...", "The final result of the calculation lay before me...", "First there was light, and then there was no-light...", "The firmament was rent asunder...", "The flicker, the bluish light... getting closer somehow...", "For our clock does not tick seconds, but years...", "For the first time in their lives there was no clock...", "Gone is the ideal of a universe whose course follows strict rules...", "He hoped he was waiting for nothing at all...", "The hours of Folly are measured by the clock...", "I am Tik-Tok, the Royal Army of Oz...", "The innocent, the innocent, Mandus...", "I sit upon a black throne in the shadows but they shall not see me...", "It was more than darkness...", "Leaves that rustled, twigs that scraped...", "Listen to the sound of the universe...", "Our clocks do not measure time...", "Repent, Harlequin...", "Reticulating splines...", "Same time tomorrow...", "The sinister, the terrible, never deceive...", "Sixteen candles burn in her mind...", "Supposing I hadn't counted the cogs properly...", "There is no time without change...", "They are dancing in a room in which the clocks have no hands...", "They must know by now I'm in here trembling...", "The universe hides in light...", "This is the great lesson...", "Villains, dissemble no more!", "The world before your eyes is finite...", "The world is a machine...", "The wrong method with the wrong technique...", "We must go on, because we can't turn back...", "Walls seemed to shift and advance..."];
var renderQuote = renderQuotes[~~(fxrand()*renderQuotes.length)];

// Density value
var densityValues = [2, 8, 8, 16, 16, 16, 32, 32, 32, 32, 48, 48, 48, 64, 64, 128];
var densityValue = densityValues[~~(fxrand()*densityValues.length)];

// Adjust for low density values and the lightness of render mode 0 at low maxFrames
if (densityValue <= 8) {
	maxFrames += 256;
}

if (densityValue <= 2 && renderMode == 0) {
		maxFrames += 256;
}

// Large circles may be overlaid at key points
var overlayKey = ~~(fxrand()*fxrand()*maxFrames)

// Dark Mode
var darkMode = (fxrand()*fxrand() > 0.5);
var renderInfo = "Render mode for this instance is " + renderModeDescriptions[renderMode] + ", using a " + paletteDescription + " palette. The render is in " + (darkMode == true ? "dark mode" : "light mode") + " with a faint tracework of " + (overlayModeSquare == true ? "squares" : "circles") + " overlaid to add texture and depth.\n\nThe rendering process comprises " + maxFrames + " frames, and has a density of " + densityValue + " out of a possible 128. Initial rotation is " + ~~(rotationOffset*100)/100 + " radians, with further increments of " + (1/smallRotation == ~~(1/smallRotation) ? "1 radian" : "1/" + smallRotation + " of a radian") + " per iteration. Large-scale texture is added every " + overlayKey + " frames. All output is generated entirely in code.";

window.$fxhashFeatures = {
	"Colour Mode": (darkMode == true ? "Dark" : "Light"),
	"Render Mode": shortRenderModeDescriptions[renderMode],
	"Density": densityValue,
	"Palette": paletteDescription[0].toUpperCase() + paletteDescription.substring(1)
}

function setup() {
	pixelDensity(1);
	randomSeed(randomSeedValue);
	noiseSeed(noiseSeedValue);
	
	screenSize = min(windowWidth, windowHeight);
	createCanvas(screenSize, screenSize);
	colorMode(HSB, 360);
	rectMode(CENTER);
	imageMode(CENTER);

	// Main graphics buffer
	mainGraphics = createGraphics(fullRes, fullRes);
	mainGraphics.colorMode(HSB, 360);
	if (darkMode) {
		mainGraphics.background(backgroundHue, 60, 180);
		} else {
		mainGraphics.background(backgroundHue, 60, 345);
	}
	
	// Clock graphics buffer
	clockGraphics = createGraphics(fullRes, fullRes);
	clockGraphics.colorMode(HSB, 360);
		clockGraphics.drawingContext.shadowOffsetY = 0;
		clockGraphics.drawingContext.shadowOffsetX = 0;
		clockGraphics.drawingContext.shadowBlur = fullRes/128;
		clockGraphics.drawingContext.shadowColor = "#000000";

	// Overlay graphics buffer
	overlayGraphics = createGraphics(fullRes, fullRes);
	overlayGraphics.colorMode(HSB, 360);
	overlayGraphics.translate(overlayGraphics.width/2, overlayGraphics.height/2);
	overlayGraphics.rotate(overlayGraphicsRotation*PI/2);
	overlayGraphics.translate(-overlayGraphics.width/2, -overlayGraphics.height/2);
	
	// Finished render buffer
	finishedRender = createGraphics(fullRes, fullRes);
	finishedRender.colorMode(HSB, 360);
	finishedRender.background(backgroundHue, 60, 345);
	finishedRender.colorMode(HSB, 360);
	finishedRender.rectMode(CENTER);
	finishedRender.imageMode(CENTER);
}

function draw() {
	mainGraphics.resetMatrix();
	mainGraphics.translate(mainGraphics.width/2, mainGraphics.height/2);
	mainGraphics.translate(offsetX, offsetY);
	
	// Bisect canvas with a slightly-lighter half on frame 1
	if (frameCount == 1) {
		if (darkMode) {
			overlayGraphics.fill(0, 10);
		} else {
			overlayGraphics.fill(360, 30);
		}
		overlayGraphics.noStroke();
		overlayGraphics.quad(0, 0, 0, random(fullRes*0.2, fullRes*0.8), fullRes, random(fullRes*0.2, fullRes*0.8), fullRes, 0);
	}
	
	if (frameCount < maxFrames) {
	
		// Texture overlay render loop
		overlayGraphics.noFill();
		overlayGraphics.strokeWeight(0.5);
		for (var i=0; i<fullRes; i+=maxFrames/64) {
			if (darkMode) {
				if (overlayModeSquare) {
					overlayGraphics.stroke(backgroundHue, 30, 30, 30);
				} else {
					overlayGraphics.stroke(backgroundHue, 30, 30, 60);
				}
			} else {
				if (overlayModeSquare) {
					overlayGraphics.stroke(backgroundHue, 330, 90, 30);
				} else {
					overlayGraphics.stroke(backgroundHue, 330, 90, 45);
				}
			}
			var randomLocation = random(1)*random(1)*random(1)*i;
			var size=dist(randomLocation, 0, 0, 0)*0.1;
			if (overlayModeSquare) {
				overlayGraphics.rect(random(1)*fullRes, fullRes-randomLocation, size, size);
			} else {
				overlayGraphics.ellipse(random(1)*fullRes, fullRes-randomLocation, size, size);
			}
		}
	
		// Main rendering loops
		for (var i=0.1; i < 1.1; i+=0.05) {
		
			// Main rotation - change increases over the render
			var mainRotation = map(frameCount/maxFrames, 0, 1, -TAU, TAU);
			mainGraphics.rotate(rotationOffset + mainRotation);

		// Larger circles for texture
			if (frameCount%overlayKey == 0) {
				mainGraphics.noStroke();
				mainGraphics.fill(360, map(i, 0.1, 1.1, 20, 0));
				mainGraphics.ellipse(0, map(frameCount, 0, maxFrames, 0, fullRes), map(overlayKey, 0, maxFrames/2, 0, fullRes), map(overlayKey, 0, maxFrames/2, 0, fullRes));
				mainGraphics.fill(0, map(i, 0.1, 1.1, 5, 0));
				mainGraphics.ellipse(map(frameCount, 0, maxFrames, 0, fullRes), 0, map(overlayKey, 0, maxFrames/2, 0, fullRes), map(overlayKey, 0, maxFrames/2, 0, fullRes));
			}

			for (var j=0; j < 1; j+=i/densityValue) {
				// Smaller rotation
				var smallRotation = map(j, 0, 1, 0, TAU/smallRotation);
				mainGraphics.rotate(smallRotation);
				// Map i and j to co-ordinates on the canvas
				// Mapping x has little effect, but adds some variance
				// Mapped y from 0 to fullRes, allowing for distance-based renders
				var xPos = map(i, 0.1, 1.1, -8, 8);
				var yPos = map(j, 0, 1, 0, fullRes);
			
				// Default strokeWeight based on noise at co-ordinates
				mainGraphics.strokeWeight(noise(xPos*0.1, yPos*0.1)*0.75);
			
				// Default size
				// May be changed by render modes
				var size = ((mainGraphics.width/2)-dist(xPos, yPos, 0, 0))*0.025;			
				switch (renderMode) {
					case 0: // Short dark lines, some circles
						mainGraphics.stroke(0, map(frameCount, 0, maxFrames, 120, 30));
						mainGraphics.strokeWeight(noise(xPos*10, yPos)*0.5);
						var lineSize = map(frameCount, 0, maxFrames, 1, 1.1);
						mainGraphics.line(xPos, yPos, xPos*lineSize, yPos*lineSize);
						mainGraphics.noStroke();
						if (noise(xPos, yPos) < 0.25) {
							mainGraphics.fill(360, map(frameCount, 0, maxFrames, 0, 180));
							size = ((fullRes/2)-dist(xPos, yPos, offsetX, offsetY))/96;
							mainGraphics.ellipse(xPos, yPos, size, size);
						}
						if (noise(xPos, yPos) > 0.85) {
							mainGraphics.fill(0, map(frameCount, 0, maxFrames, 4, 0));
							size = ((fullRes/2)-dist(xPos, yPos, offsetX, offsetY))/3;
							mainGraphics.ellipse(xPos, yPos, size, size);
						}
					break;
					case 1:
						mainGraphics.stroke(0, map(frameCount, 0, maxFrames, 180, 300));
						mainGraphics.fill(360, map(frameCount, 0, maxFrames, 60, 0));
						// Use default size
						mainGraphics.ellipse(xPos, yPos, size, size);
					break;
					case 2: // Light rectangles, with slight dark texturing
						mainGraphics.stroke(180, map(frameCount, 0, maxFrames, 180, 90));
						mainGraphics.fill(360, map(frameCount, 0, maxFrames, 360, 0));
						// Use default size
						mainGraphics.rect(xPos, yPos, size, size);
						mainGraphics.noStroke();
						if (noise(xPos/100, yPos/100) > 0.5) {
							mainGraphics.fill(180, map(frameCount, 0, maxFrames, 60, 0));
							size = ((fullRes/2)-dist(xPos, yPos, offsetX, offsetY))/96;
							mainGraphics.ellipse(xPos, yPos, size, size);
						}
					break;
					case 3: // Slightly-less light circles
						mainGraphics.stroke(90, map(frameCount, 0, maxFrames, 180, 0));
						mainGraphics.fill(360, map(frameCount, 0, maxFrames, 360, 0));
						// Use default size
						mainGraphics.ellipse(xPos, yPos, size, size);
					break;
					case 4: // Coloured rectangles
						mainGraphics.stroke(60, map(frameCount, 0, maxFrames, 180, 300));
						mainGraphics.fill(backgroundHue, 360, 360, map(frameCount, 0, maxFrames, 30, 0));
						// Use default size
						mainGraphics.rect(xPos, yPos, size, size);
					break;
					case 5: // Crosshatching
						mainGraphics.strokeWeight(map(frameCount, 0, maxFrames, 0, 2));
						if (noise(xPos/10, yPos/10) < 0.5) {
							// White stroke, fading in as frameCount increases
							mainGraphics.stroke(360, map(frameCount, 0, maxFrames, 20, 90));
							mainGraphics.line(xPos, yPos, xPos-size, yPos-size);
						} else {
							// Dark stroke, fading out as frameCount increases
							mainGraphics.stroke(0, map(frameCount, 0, maxFrames, 180, 20));
							mainGraphics.line(xPos, yPos, xPos+size, yPos-size);
						}
						if (noise(yPos, xPos) < 0.5) {
							mainGraphics.noFill();
							mainGraphics.strokeWeight(0.5);
							mainGraphics.fill(360, map(frameCount, 0, maxFrames, 10, 0));
							size = ((fullRes/2)-dist(xPos, yPos, 0, 0))/32;
							mainGraphics.ellipse(xPos, yPos, size, size);
						}
					break;
					case 6:
							mainGraphics.fill(360, map(frameCount, 0, maxFrames, 16, 8));
							mainGraphics.noStroke();
							mainGraphics.push();
							mainGraphics.rotate(PI);
							mainGraphics.rect(xPos, yPos, size/2, size/2);
							mainGraphics.pop();
						if ((~~yPos)%96 == 0 ) {
							mainGraphics.strokeWeight(map(frameCount, 0, maxFrames, 1, 0));
							mainGraphics.stroke(0, map(frameCount, 0, maxFrames, 90, 0));
							mainGraphics.line(xPos-size, yPos+size, xPos+size, yPos-size);
							mainGraphics.line(xPos+size, yPos-size, xPos-size, yPos-size);
						} else {
							// White stroke, fading in as frameCount increases
							mainGraphics.strokeWeight(map(dist(yPos, yPos, 0, 0), 0, fullRes, 0, 2));
							mainGraphics.stroke(60, map(frameCount, 0, maxFrames, 30, 0));
							mainGraphics.noFill();
							mainGraphics.rect(xPos, yPos, size, size);
						}
						break;
					}
				}
		}
	}

	// Display graphics layers
	background(360);
	translate(screenSize/2, screenSize/2);
			
	if (frameCount < maxFrames) {
		image(mainGraphics, 0, 0, screenSize*0.975, screenSize*0.975);
		image(overlayGraphics, 0, 0, screenSize*0.975, screenSize*0.975);
		if (dimWhileRendering) {
			fill(backgroundHue, 15, 360, (1-(frameCount/maxFrames))*360);
			rect(0, 0, screenSize*0.975, screenSize*0.975);
		}
		stroke(180);
		strokeWeight(1);
		fill(0);
		textSize(screenSize/16);
		textAlign(CENTER, CENTER);
		textStyle(BOLD);
		text("Rendering", 0, -screenSize*0.06);
		textSize(screenSize/48);
		textStyle(ITALIC);
		text(renderQuote, 0, screenSize/24, screenSize*0.75);
		stroke(0);
		strokeWeight(screenSize/96);
		line(-screenSize*0.4, 0, screenSize*0.4, 0);
		stroke(300);
		line(-screenSize*0.4, 0, -screenSize*0.4+(frameCount/maxFrames*screenSize*0.8), 0);
	} else if (frameCount == maxFrames) {
		// Produce the final render
		finishedRender.background(360);
		finishedRender.translate(fullRes/2, fullRes/2);
		finishedRender.noFill();
		finishedRender.strokeWeight(max(fullRes/512, 1));
		finishedRender.stroke(0);
		finishedRender.rect(0, 0, fullRes*0.975, fullRes*0.975);
		finishedRender.image(mainGraphics, 0, 0, fullRes*0.975, fullRes*0.975);
		finishedRender.image(overlayGraphics, 0, 0, fullRes*0.975, fullRes*0.975);
		image(finishedRender, 0, 0, screenSize, screenSize);
		// Rendering is complete, so let fxhash know
		fxpreview();

		// If the user has already interacted with the overlay, respect that decision
		if (!showInfoInteracted) {
			showInfo = false;
		}
	} else {
		// Rendering is done: our draw loop displays the finished artwork
		image(finishedRender, 0, 0, screenSize, screenSize);
	}
	
	// Clock
	if (clockAlpha != 0) {
		clockGraphics.clear();
		clockGraphics.resetMatrix();
		clockGraphics.translate(mainGraphics.width/2, mainGraphics.height/2);
		clockGraphics.translate(offsetX, offsetY);
		clockGraphics.fill(360, 0.1*clockAlpha*360);
		var s = map(second(), 0, 60, 0, TWO_PI) - HALF_PI;
		var theDate = new Date();
		s += theDate.getMilliseconds()/10000;
		var m = map(minute() + norm(second(), 0, 60), 0, 60, 0, TWO_PI) - HALF_PI;
		var h = map(hour() + norm(minute(), 0, 60), 0, 24, 0, TWO_PI * 2) - HALF_PI;

		if (darkMode || renderMode == 4) {
			clockGraphics.stroke(360, clockAlpha*360);
		} else {
			clockGraphics.stroke(0, clockAlpha*360);
		}
		clockGraphics.strokeWeight(2);
		clockGraphics.line(cos(s)*clockDistance, sin(s)*clockDistance, cos(s)*fullRes, sin(s)*fullRes);
		clockGraphics.strokeWeight(4);
		clockGraphics.line(cos(m)*clockDistance, sin(m)*clockDistance, cos(m)*fullRes, sin(m)*fullRes);
		clockGraphics.strokeWeight(6);
		clockGraphics.line(cos(h)*clockDistance, sin(h)*clockDistance, cos(h)*fullRes, sin(h)*fullRes);
		image(clockGraphics, 0, 0, screenSize*0.975, screenSize*0.975);
	}
	
	if (clockAlphaTarget > clockAlpha) {
		clockAlpha = min(1, clockAlpha + 0.025);
	}
	
	if (clockAlphaTarget < clockAlpha) {
		clockAlpha = max(0, clockAlpha - 0.025);
	}
	
	// Border rectangle
	noFill();
	strokeWeight(max(screenSize/512, 1));
	stroke(0);
	rect(0, 0, screenSize*0.975, screenSize*0.975);

	
	// Display the description text. This option is toggled with 'i'.
	if (showInfo) {
		stroke(180);
		strokeWeight(1);
		fill(0);
		textSize(screenSize/56);
		textAlign(LEFT, TOP);
		textStyle(BOLD);
		text("There is a Clock at the Heart of the Universe", 0, -screenSize*0.45, screenSize*0.9);
		textStyle(ITALIC);
		text("\n" + renderInfo + (frameCount < maxFrames ? "\n\nPress [i] to show/hide this information." : ""), 0, -screenSize*0.45, screenSize*0.9);
	}

}

function keyPressed() {

	// Save the finished output
	if (key == 's' && frameCount >= maxFrames) {
		save(finishedRender, "ThereIsAClock_" + fxhash, "png");
	}
	
	// Toggle information display
	if (key == 'i') {
		showInfo = !showInfo;
		showInfoInteracted = true;
	}
	
	// Toggle super-secret clock display
	if (key == 'c' && frameCount > maxFrames) {
		clockAlphaTarget = (clockAlphaTarget+1)%2;
	}
	
}

function windowResized() {
	if (navigator.userAgent.indexOf("HeadlessChrome") == -1) {
		screenSize = min(windowWidth, windowHeight);
		resizeCanvas(screenSize, screenSize);
	}
}