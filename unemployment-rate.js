function UnemploymentRate(){
  this.name = '16+ Unemployment Rate London and UK';
  this.id = 'unemployment-rate';

  // Title to display above the plot.
  this.title = 'London and UK 16+ unemployment rate 2004-21';

  // Names for each axis.
  this.xAxisLabel = 'Year';
  this.yAxisLabel = '%';

  // Names of the two areas
  this.sample1 = 'London';
  this.sample2 = 'UK';
  const marginSize = 35;
  
  // Layout object to store all common plot layout parameters and
  // methods.
  // ES6 arrow function, removes DOM elements when current option unselected
  this.destroy = ()=> {
    this.statsBtn.remove();
    this.colorPicker1.remove();
    this.colorPicker2.remove();
    this.colorInfo.remove();
  }
  this.preload = ()=> {
    var self = this;
    this.data = loadTable(
      './data/unemployment-rate/annual-unemployment-region - Unemployed.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded = true;
    });
  };

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
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 20,
    numYTickLabels: 10,
  };

  this.setup = ()=> {
    // Font defaults.
    textSize(16);
    
    // Start and end year along with min and max employment rate
    this.startYear = this.data.getNum(0, 'Year');
    this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'Year');
    this.minRate = 0;
    this.maxRate = 10;

    this.statsOn = false;
    // p5js function, creates button dom element, when pressed calls func showStats
    this.statsBtn = createButton('Show Stats');
    this.statsBtn.position(width - 240,600);
    this.statsBtn.mousePressed(this.showStats);

    // This will add options to select which colours the user wants the bar to be
    // good for accessibilty purposes.
    this.colorPicker1 = createColorPicker('#FFA500');
    this.colorPicker1.position(525, height + 30);

    this.colorPicker2 = createColorPicker('#0096FF');
    this.colorPicker2.position(600, height + 30);

    this.colorInfo = createDiv('Click here to change bar colours');
    this.colorInfo.position(475,height);
  };
  
  this.draw = ()=>{
    // Draws x and y axis with the labels&ticks
    drawAxis(this.layout);

    drawAxisLabels(
      this.xAxisLabel,
      this.yAxisLabel,
      this.layout);

    drawYAxisTickLabels(
      this.minRate,
      this.maxRate,
      this.layout,
      this.mapRateToHeight.bind(this),1);
    
    // Draws title at the top of the screen along with the key which shows 
    // corresponding colour to the sample
    this.drawTitle();
    this.key();
    
    // local variable for graph height
    let grHeight = this.mapRateToHeight(0);
    // Draws x axis ticks for the years
    for(let i = 0; i < this.data.getRowCount(); i++){
      drawXAxisTickLabel(
        this.data.getNum(i , 'Year'),
        this.layout,
        this.mapYearToWidth.bind(this));

        // Draws green bars i.e. data for London
        stroke(0,0,0);
        fill(this.colorPicker1.color());
        rect(this.mapYearToWidth(this.data.getNum(i, 'Year')) - 10, grHeight,
          10, (-grHeight - (this.mapRateToHeight(this.data.getNum(i, this.sample1))) * - 1));

        // Draws light blue bars, i.e. data for UK
        fill(this.colorPicker2.color());
        rect(this.mapYearToWidth(this.data.getNum(i, 'Year')), grHeight,
          10, (-grHeight - (this.mapRateToHeight(this.data.getNum(i, this.sample2))) * - 1));

        textSize(10);
        fill(0);
        noStroke(0);
        // If stats is true, then draw the stats next to the bars
        if(this.statsOn){
          text(this.data.getNum(i, this.sample1),
          this.mapYearToWidth(this.data.getNum(i, 'Year')) - 5,
          grHeight - this.mapRateToHeight(this.data.getNum(i, this.sample1)) * -1 - 514);

          text(this.data.getNum(i, this.sample2),this.mapYearToWidth(this.data.getNum(i, 'Year')) + 9,
          grHeight - this.mapRateToHeight(this.data.getNum(i, this.sample2)) * -1 - 514);
        }
        // Revert text size to normal
        textSize(16);
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
  this.mapRateToHeight = (value)=> 
                map(value,this.minRate,this.maxRate,
                this.layout.bottomMargin, // Smaller Rate at bottom.
                this.layout.topMargin);   // Bigger Rate at top.

  this.mapYearToWidth = (value)=> map(value,this.startYear,this.endYear,
                this.layout.leftMargin + 50,   // Draw left-to-right from margin.
                this.layout.rightMargin - 50);
 
  this.key = ()=>{
    stroke(0);
    // Draws rectangles in the top right of the canvas with key colours
    fill(this.colorPicker1.color());
    rect(this.layout.rightMargin - 95,
      this.layout.topMargin - (this.layout.marginSize / 2) + 20, 15, 15);

    fill(this.colorPicker2.color());
    rect(this.layout.rightMargin - 95,
      this.layout.topMargin - (this.layout.marginSize / 2) + 45, 15, 15);

    // Draws text to show which colour the sample belongs to 
    noStroke();
    fill(0);
    textSize(12);
    text(this.sample1,this.layout.rightMargin - 55,
      this.layout.topMargin - (this.layout.marginSize / 2) + 27);
    text(this.sample2,this.layout.rightMargin - 65,
      this.layout.topMargin - (this.layout.marginSize / 2) + 52);
    textSize(16);
  }

  // This is the function the button calls when pressed
  // Shows stats and also changes the text inside the button
  // Uses ternary operators
  this.showStats = ()=>{
    this.statsOn = !this.statsOn;
    this.statsOn ? this.statsBtn.elt.innerText = 'Hide Stats' : this.statsBtn.elt.innerText = 'Show Stats';
  }
}
