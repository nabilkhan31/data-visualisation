/* This visualisation calculates the number of heads which appear after flipping ten coins. 
If the number of heads after ten coins are flipped is 6, the value at index 6 of the array of 
11 values, each representing a column, will be incremented. This is looped 50 times and the 
results are plotted */

function BellCurve(){
  this.name = "Bell Curve showing the Number of Heads after Flipping 10 Coins";
  this.id = "bell-curve";

  this.title = 'Number of Heads after Flipping 10 coins, Run 50 times, Probability of Heads = 0.5';
  this.xAxisLabel = 'Number of heads after 50 runs';
  this.yAxisLabel = 'Frequency';

  this.preload = ()=>{
    // preloads image so that its ready for use
    this.img = loadImage('images/coin2.svg');
    var self = this;
  }
  
  // removes dom element when visualisation is unselected
  this.destroy = ()=> {
    this.renderBtn.remove();
    this.curveBtn.remove();
    this.clearBtn.remove();
  }

  const marginSize = 35;
	this.layout = {
		marginSize: marginSize,
		// Margin positions around the plot. Left and bottom have double
		// margin size to make space for axis and tick labels on the canvas.
		leftMargin: marginSize * 2,
		rightMargin: width - marginSize,
		topMargin: marginSize,
		bottomMargin: height - marginSize * 2,
		pad: 5,

		plotWidth: function() {
			return this.rightMargin - this.leftMargin;
		},

		plotHeight: function() {
			return this.bottomMargin - this.topMargin;
		},

		// Boolean to enable/disable background grid.
		grid: false,

		// Number of axis tick labels to draw so that they are not drawn on
		// top of one another.
		numXTickLabels: 10,
		numYTickLabels: 10,
	};
  
  this.setup = ()=>{
    textSize(16);
    // numRuns is the number of runs which occur
    // minFreq and maxFreq are used to plot the Y axis 
    this.numRuns = 50;
    this.minFreq = 0;
    this.maxFreq = this.numRuns / 2.5;
    
    // used for mapping to x axis
    this.startHeads = 0;
    this.endHeads = 10;

    // Booleans used to control different modes
    this.showCurve = true;
    this.clearLines = false;

    // Makes image smaller so that it can fit
    this.img.resize(25,25);

    // Initialises array and maxPoint which is used by the curve Each index in this array relates
    //  to a column on the graph, i.e. the 5th index is at column number 5
    this.headArray = [0,0,0,0,0,0,0,0,0,0,0];
    this.maxPoint = 0;

    // Draws the graph 
    this.renderGraph();

    // Adds the dom elements like the buttons
    this.addDomElements();
  }
  this.draw = ()=>{

    // draws title and axis labels
    drawAxis(this.layout);
    this.drawTitle();
    drawAxisLabels(
      this.xAxisLabel,
      this.yAxisLabel,
      this.layout);

    // draws y axis ticks
    drawYAxisTickLabels(
      this.minFreq,
      this.maxFreq,
      this.layout,
      this.mapFreqToHeight.bind(this));
   
    // draws x axis ticks, i.e. the number of heads
    for (let i = 0; i <= this.endHeads; i++) {
      drawXAxisTickLabel(
        i,
        this.layout,
        this.mapHeadsToWidth.bind(this));
    }

    // local variable for graph height
    let grHeight = this.mapFreqToHeight(0);

    // Nested for loop. Outer for loop used to display the text
    // inner for loop used to draw images to the columns
    noStroke();
    for (let i = 0; i < this.headArray.length; i++) {
      text(this.headArray[i],
        this.mapHeadsToWidth(i),
        grHeight - this.mapFreqToHeight(this.headArray[i]) * -1 - 519);
      for(let j = 0; j < this.headArray[i];j++){
        image(this.img, this.mapHeadsToWidth(i) - 12,grHeight - 25 - j * 23);
      }
      // Conditional, calculates the maximum point on the graph and gets the index
      if (this.maxPoint < this.headArray[i]) {
        this.maxPoint = this.headArray[i];
        this.maxPointIndex = i;
      }
    }
    stroke(0);
    noFill();
    strokeWeight(1);

    if (!this.clearLines){
      if (this.showCurve) {
        // when showCurve is true, bezier is drawn, one is upward sloping the other is downward sloping
        // curve is drawn from the start of x axis, and the y pos of the first element in headArray
        // First bezier draws towards the maxPoint which is calculated before, second bezier
        // draws from the maxPoint to the end of the graph
        bezier(70,grHeight,
          this.mapHeadsToWidth(1),this.mapFreqToHeight(this.headArray[1]),
          this.mapHeadsToWidth(2),this.mapFreqToHeight(this.headArray[2]),
          this.mapHeadsToWidth(this.maxPointIndex),this.mapFreqToHeight(this.maxPoint));
    
        bezier(this.mapHeadsToWidth(this.maxPointIndex),this.mapFreqToHeight(this.maxPoint),
          this.mapHeadsToWidth(8),this.mapFreqToHeight(this.headArray[8]),
          this.mapHeadsToWidth(9),this.mapFreqToHeight(this.headArray[9]),
          this.layout.plotWidth(),grHeight);
      }
      else{
        // Draws the connected lines using vertex when showCurve is false
        beginShape();
        vertex(70,grHeight);
        for(let i = 0; i < this.headArray.length;i++){
          vertex(this.mapHeadsToWidth(i),this.mapFreqToHeight(this.headArray[i]));
        }
        endShape();
        // Draws the points on the graph
        fill(0);
        ellipse(70,grHeight);
        for(let i = 0; i < this.headArray.length; i++){
          ellipse(this.mapHeadsToWidth(i),this.mapFreqToHeight(this.headArray[i]),5);
        }
      } 
    }
  }    

  // draws the title at the top of the screen in the center of the canvas
  this.drawTitle = ()=> {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    text(this.title,
      (this.layout.plotWidth() / 2) + this.layout.leftMargin,
      this.layout.topMargin - (this.layout.marginSize / 2));
  };

  // These functions are important so taht we can map our data values to the 
  // axis of the graph.

  this.mapFreqToHeight = (value)=> 
                map(value,this.minFreq,this.maxFreq,
                this.layout.bottomMargin, // Smaller Freq at bottom.
                this.layout.topMargin);   // Bigger Freq at top.

  // starts the graph more inside the plot
  this.mapHeadsToWidth = (value)=> map(value,this.startHeads,this.endHeads,
                this.layout.leftMargin + 175,   // Draw left-to-right from margin.
                this.layout.rightMargin - 175);
    
  // re renders the graph if the user wants to make a new graph
  this.renderGraph = ()=>{
    // Resets the values to 0 
    for(let i = 0; i < this.headArray.length; i++){
      this.headArray[i] = 0;
    }
    this.maxPoint = 0;

    /* For loop, numHeads holds the value of how many heads after ten coins are flipped
    switch is used, for example, if the number of heads flipped was 3, then the value of 
    numHeads would be 3. This means that case 3 would be executed, and the value at 
    headArray[3] is incremented. headArray[3] relates to the number 3 on the x axis */
     
    for (let i = 0; i < this.numRuns; i++) {
      let numHeads = 0;
      for (let j = 0; j <= 10; j++) {
        if (Math.random() > 0.5) {
          numHeads += 1;
        }
      }
      switch (numHeads) {
        case 0:
          this.headArray[0]++;
          break;
        case 1:
          this.headArray[1]++;
          break;
        case 2:
          this.headArray[2]++;
          break;
        case 3:
          this.headArray[3]++;
          break;
        case 4:
          this.headArray[4]++;
          break;
        case 5:
          this.headArray[5]++;
          break;
        case 6:
          this.headArray[6]++;
          break;
        case 7:
          this.headArray[7]++;
          break;
        case 8:
          this.headArray[8]++;
          break;
        case 9:
          this.headArray[9]++;
          break;  
        case 10:
          this.headArray[10]++;
          break;
      }
    }
  }

  // Toggles the boolean this.showCurve, and switches the inner text
  this.showStats = ()=>{
    this.showCurve = !this.showCurve;
    this.showCurve ? this.curveBtn.elt.innerText = 'Switch to Line' : 
      this.curveBtn.elt.innerText = 'Switch to Curve';
  }

  this.addDomElements = ()=>{
    // Displays a new graph different to the old
    this.renderBtn = createButton('Render New Graph');
    this.renderBtn.position(975, 600);
    this.renderBtn.mousePressed(this.renderGraph);

    // Switches modes to the mode with curved lines
    this.curveBtn = createButton('Switch to Curve');
    this.curveBtn.position(775, 600);
    this.curveBtn.mousePressed(this.showStats);

    // Clears the lines from the canvas
    this.clearBtn = createButton('Hide Lines');
    this.clearBtn.position(575, 600);

    // clearBtn function, toggles the boolean this.clearLines, changes inner text of btn
    this.clearBtn.mousePressed(()=>{
      this.clearLines = !this.clearLines;
      this.clearLines ? this.clearBtn.elt.innerText = 'Show Lines' : 
      this.clearBtn.elt.innerText = 'Hide Lines';
    });
  }
}