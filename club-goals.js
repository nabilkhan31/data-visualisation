let locked = false;
let sf = 1; // scaleFactor
let xShift = 0; // pan in X direction
let yShift = 0; // pan in Y direction
// Global variablse so that keypressed and keyreleased functions have access to them
function ClubGoals(){
	this.name = 'Premier League 2021/22 Season Club Goals';
	this.id = 'club-goals';

	this.yAxisLabel = 'Goals Scored';
	this.title = 'Premier League 2021/22 Season Club Goals';

	const marginSize = 35;

	// Removes the created dom elements
	this.destroy = ()=> {
		this.tableBtn.remove();
		this.div.remove();
	}
	this.preload = ()=> {
		var self = this;
		this.data = loadTable(
			'./data/club-goals/2021 Premier League Goals.csv', 'csv', 'header',
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
		grid: false,

		// Number of axis tick labels to draw so that they are not drawn on
		// top of one another.
		numXTickLabels: 10,
		numYTickLabels: 20,
	};
	
	this.setup = ()=> {
		// Font defaults.
		textSize(16);
		// minimum amount of goals scored, maximum, no team got over 100 goals in that
		// season
		this.minGoal = 0;
		this.maxGoal = 100;
		this.numItems = this.data.getRowCount();

		// Used to store the outliers which are high and those which are low
		this.highOutliers = [];
		this.lowOutliers = [];

		// calls function to find the median of the dataset the 1st & 3rd quartile
		// also use the findMedian function to find their value
		this.medianGoals = this.findMedian(this.numItems);    
		this.q1 = this.findMedian(30);
		this.q3 = this.findMedian(10);

		// interquartile range, distance between q3 and q1
		this.iqr = this.q3 - this.q1;
		this.minPoint = this.data.getNum(this.numItems - 1, 'Goals');

		// limits are used to figure out which values are outliers
		minLimit = this.q1 - (1.5 * this.iqr);
		maxLimit = this.q3 + (1.5 * this.iqr);

		// Populating outliers arrays
		for(let i = 0; i < this.numItems; i++){
				if(this.data.getNum(i,'Goals') > maxLimit){
						this.highOutliers.push(this.data.getNum(i,'Goals'));
				}else if(this.data.getNum(i,'Goals') < minLimit){
						this.lowOutliers.push(this.data.getNum(i,'Goals'));
				}
		}
		
		// stats array which holds information of key data points
		this.stats = [
			{name:'Median (50th %tile): ',number:this.medianGoals, yPos:this.mapGoalsToHeight(this.medianGoals)},
			{name:'First Quartile (25th %tile): ',number:this.q1, yPos:this.mapGoalsToHeight(this.q1)},
			{name:'Third Quartile (75th %tile): ',number:this.q3, yPos:this.mapGoalsToHeight(this.q3)},
			{name:'Outliers: ',number:this.highOutliers, yPos:this.mapGoalsToHeight(this.highOutliers[1])},
			{name:'Minimum Point: ',number:this.minPoint, yPos:this.mapGoalsToHeight(this.minPoint)}];
			
		// p5js createButton, calls the showstats function
		this.show = false;
		this.tableBtn = createButton('Show Table');
		this.tableBtn.position(width - 240,550);
		this.tableBtn.mousePressed(this.showStats);

		// div created to display info to the user for usability purposes
		this.div = createDiv('Zoom in with mouse wheel, Press the LEFT ARROW to reset to original size');
		this.div.position(width-460, 600);
	};

	this.draw = ()=>{
		// This code translates by xshift and yshift when the scroll wheel is used
		// and the scale(sf) applies the scale factor and zooms in
		translate(xShift,yShift);
		scale(sf);

		// Drwas the axis, title, and the initial stats such as first, third quartile
		// outliers and median
		drawAxis(this.layout);
		this.drawTitle();
		this.drawStats();
		drawAxisLabels(this.xAxisLabel,this.yAxisLabel,this.layout);

		drawYAxisTickLabels(this.minGoal,this.maxGoal,
		this.layout,this.mapGoalsToHeight.bind(this),0);
			
		this.drawOutliers();	
		this.drawBoxPlot();
	}

	// maps the goals to the height using minGoal and maxGoal
	this.mapGoalsToHeight = (value) => 
		map(value,this.minGoal,this.maxGoal,
				this.layout.bottomMargin,
				this.layout.topMargin);

	// function to find the median of a set of values
	this.findMedian = (value) => {
		let median = (value + 1)/2;
		// numOne numTwo scope limited to this function
		let numOne = Math.floor(median);
		let numTwo = Math.ceil(median);
		median = (this.data.getNum(numOne - 1, 'Goals') + this.data.getNum(numTwo - 1, 'Goals')) / 2;
		return median;
	}
	// draws the title to the top of the canvas
	this.drawTitle = ()=> {
		fill(0);
		noStroke();
		textAlign('center', 'center');
		text(this.title,
					(this.layout.plotWidth() / 2) + this.layout.leftMargin,
					this.layout.topMargin - (this.layout.marginSize / 2));
	};

	// function to draw the box plot
	this.drawBoxPlot = ()=>{
		fill(0);
		// These lines are used to draw the actual box plot itself
		line(300, this.mapGoalsToHeight(this.q1), 300,
			this.mapGoalsToHeight(this.minPoint));

		// line drawing the minimum point
		line(250, this.mapGoalsToHeight(this.minPoint),
			350, this.mapGoalsToHeight(this.minPoint));

		// line drawn from q3 to the maximum point before reaching outliers
		line(300, this.mapGoalsToHeight(this.q3),
			300, this.mapGoalsToHeight(this.data.getNum(this.highOutliers.length, 'Goals')));

		// line drawn horizontally on the maximum point before reaching outliers
		line(250, this.mapGoalsToHeight(this.data.getNum(this.highOutliers.length, 'Goals')),
			350, this.mapGoalsToHeight(this.data.getNum(this.highOutliers.length, 'Goals')));

		// rectangle drawn to box the data in
		noFill();
		rect(200,this.mapGoalsToHeight(this.q3),200,
			(this.mapGoalsToHeight(this.q3) - this.mapGoalsToHeight(this.q1)) * - 1);

		// line which draws the median horizon
		line(200, this.mapGoalsToHeight(this.medianGoals),
			400, this.mapGoalsToHeight(this.medianGoals));
	}

	this.drawOutliers = ()=>{
		// Draws the outliers as small ellipses
		fill(255);
		stroke(0);
		for(let i = 0; i < this.highOutliers.length; i++){
				ellipse(300, this.mapGoalsToHeight(this.highOutliers[i]), 5);
		}
		for(let i = 0; i < this.lowOutliers.length; i++){
				ellipse(300, this.mapGoalsToHeight(this.lowOutliers[i]), 5);
		}
	}
	// Draws stats onto the screen
	this.drawStats = ()=>{
		// Make text smaller, if show is true then draw the stats onto the screen
		// otherwise dont draw them
		stroke(0);
		textAlign(LEFT);
		textSize(12);
		if(this.show){
			noFill();
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < this.numItems - 3; j++) {
					rect(this.layout.plotWidth()  - 300 + i * 160,
						this.layout.topMargin + j * 20, 160, 100);
				}
			}
			fill(0);
			noStroke();
			for(let i = 0; i < this.numItems; i++){
					text(this.data.getString(i, 'Club'), this.layout.plotWidth() - 290, this.layout.topMargin + 30 + i * 20);
					text(this.data.getNum(i, 'Goals'), this.layout.plotWidth() - 68, this.layout.topMargin + 30 + i * 20);
			}

			stroke(0);
			text('CLUB', this.layout.plotWidth() - 290, this.layout.topMargin + 10);
			text('GOALS', this.layout.plotWidth() - 80, this.layout.topMargin + 10);
		}
		noStroke();
		for (let i = 0; i < this.stats.length; i++) {
				text(this.stats[i].name + this.stats[i].number,
					this.layout.plotWidth() - 480, this.stats[i].yPos);
		}
		// Reset text settings to default
		stroke(0);
		textAlign(CENTER);
		textSize(16);
	}
	// uses ternary operators to change value of show and the text of button
	// whenever button is pressed
	this.showStats = ()=>{
		this.show = !this.show;
		this.show ? this.tableBtn.elt.innerText = 'Hide Table' : this.tableBtn.elt.innerText = 'Show Table';
	}
	// event listener, checks for scrolling, when scrolling up, value = positive when
	// scrolling down value is negative, if the value is positive then 1.02 gets passed
	// into the changeScale function otherwise 0.98 gets passed in
	window.addEventListener("wheel", function(e) {
		changeScale(e.deltaY > 0 ? 1.02 : 0.98);
	});

	// multiplies the scale factor by the value which is passed in, changes the
	// xShift and yShift values
	changeScale = (s)=> {
		sf *= s;
		xShift = mouseX * (1-s) + xShift * s;
		yShift = mouseY * (1-s) + yShift * s;
	} 
}

// if the left arrow is pressed, then the zoom and translation is set back to the 
// original values
keyPressed = ()=> {
	if (keyCode == LEFT_ARROW && !locked) {
		locked = true;
		xShift = 0;
		yShift = 0;
		sf = 1;
	}
}
keyReleased = ()=> {
	if (keyCode === LEFT_ARROW && locked) {
		locked = false;
	}
}