function PeriodicTableStatic(){
	this.name = 'First 20 Elements of the Periodic Table, using constructor';
	this.id = 'periodic-table-static';

	this.xAxisLabel = 'Year Discovered';
	this.yAxisLabel = '';
	const marginSize = 35;

	// removes all the paragraph elements when switching gallery items
	this.destroy = ()=> this.removeDomElements();

	this.preload = ()=> {
		var self = this;
		this.data = loadTable(
			'./data/periodic-table/Periodic Table.csv', 'csv', 'header',
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
		numXTickLabels: 30,
		numYTickLabels: 20,
	};
	
	this.setup = ()=> {
		textSize(16);
		// stores all the groups of the elements we are using
		this.groups = ['Nonmetal','Noble Gas','Alkali Metal','Alkaline',
		'Semimetal','Halogen','Basic Metal'];

		// array to store all the elements
		this.elements = [];

		// array to store the colors of the groups
		this.keyColor = [color(0,0,0),color(255,0,0),color(0,0,255),color(100,100,100),
											color(100,200,200),color(255,100,50),color(50,50,200)];

		// pushes the data from csv file to the elements array by creating
		// new objects from the constructor
		for (let i = 0; i < this.data.getRowCount(); i++) {
				this.elements.push(new Element(
										this.data.getString(i,'Element'),
										this.data.getString(i, 'Symbol'),
										this.data.getNum(i, 'Atomic Mass'),
										this.data.getString(i, 'Group'),
										this.data.getString(i, 'Discoverer'),
										this.data.getNum(i, 'Year discovered'),
										'',0,this));
		}
				
		this.startYear = 1640;
		this.endYear = 1900;

		// adds the p dom elements
		this.addDomElements();
	}

	this.draw = ()=>{

		// draws the axis with the labels
		drawAxis(this.layout);
		drawAxisLabels(this.xAxisLabel,this.yAxisLabel,this.layout);
		textSize(12);
		textAlign(RIGHT);

		// Draws the y axis ticks which are the names of the groups
		for(let i = 0; i < this.groups.length;i++){
			text(this.groups[i],65, 50 + i * 70);
			stroke(0);

			// If i is less than 6, then the lines are drawn normally with 70 pixel gap,
			// but if i is greater than 6, then it is made to align with the bottommargin
			i < 6 ? line(0,85 + i * 70,this.layout.rightMargin,85 + i * 70) : 
			line(0,this.layout.bottomMargin,this.layout.leftMargin,this.layout.bottomMargin);
			noStroke();
		}
		noStroke();
		textAlign(CENTER);
		textSize(16);

		// draws x axis labels which plots the years
		for(let i = 0; i < this.layout.numXTickLabels;i++){
			drawXAxisTickLabel(
				1640 + i * 20,
				this.layout,
				this.mapYearToWidth.bind(this));
		}

		// calls the methods used by objects in elements array
		//  in a for loop of element length
		for (let i = 0; i < this.elements.length; i++) {
			this.elements[i].findGroup();
			this.elements[i].mouseOver();
			this.elements[i].draw();
		}
	}

	this.mapYearToWidth = (value) => map(value,this.startYear,this.endYear,
									this.layout.leftMargin,   // Draw left-to-right from margin.
									this.layout.rightMargin);

	// Constructor function to create the elements
	function Element(element,symbol,atomicMass,group,discoverer,year,color,yPos,self){
		this.element = element;
		this.symbol = symbol;
		this.atomicMass = atomicMass;
		this.group = group;
		this.discoverer = discoverer;
		this.year = year;
		this.color = color;
		this.yPos = yPos;

		// used to determine which group an element belongs to, then it is assigned
		// its colour and yPosition.
		this.findGroup = ()=>{
			if (this.group == 'Nonmetal') {
					this.color = self.keyColor[0];
					this.yPos = 50;
			} else if (this.group == 'Noble Gas') {
					this.color = self.keyColor[1];
					this.yPos = 120;
			} else if (this.group == 'Alkali Metal'){
					this.color = self.keyColor[2];
					this.yPos = 190;
			} else if (this.group == 'Alkaline'){
					this.color = self.keyColor[3];
					this.yPos = 260;
			} else if (this.group == 'Semimetal'){
					this.color = self.keyColor[4];
					this.yPos = 330;
			} else if (this.group == 'Halogen'){
					this.color = self.keyColor[5];
					this.yPos = 400;
			} else {
					this.color = self.keyColor[6];
					this.yPos = 470;
			}
		}

		// draws the elements onto the screen, correctly mapped onto the graph
		// then it puts the symbol above it.
		this.draw = ()=> {
			fill(this.color);
			ellipse(self.mapYearToWidth(this.year),this.yPos, 20);
			text(this.symbol,
				self.mapYearToWidth(this.year),
				this.yPos - 20);
		}

		// this function checks whether the mouse is above the element or not
		// if the mouse is above then the paragraph elements with the stats
		// are moved to the position of the element and are updated with the 
		// elements details, e.g. year discovered & atomic mass
		this.mouseOver = ()=> {
			// local variable d
			let distance = dist(mouseX,mouseY,
				self.mapYearToWidth(this.year),this.yPos);
			if (distance < 15) {
				textSize(12);
				self.pElement.elt.innerHTML = 'Element: ' + this.element;
				self.pElement.position(self.mapYearToWidth(this.year) + 280,this.yPos + 5);

				self.pAtomicMass.elt.innerHTML = 'Atomic Mass: ' + this.atomicMass;
				self.pAtomicMass.position(self.mapYearToWidth(this.year) + 280,this.yPos + 55);

				self.pGroup.elt.innerHTML = 'Group: ' + this.group;
				self.pGroup.position(self.mapYearToWidth(this.year) + 280,this.yPos + 85);

				self.pYearDiscovered.elt.innerHTML = 'Year Discovered: ' + this.year;
				self.pYearDiscovered.position(self.mapYearToWidth(this.year) + 280,this.yPos + 115);

				self.pDiscoverer.elt.innerHTML = 'Discoverer: ' + this.discoverer;
				self.pDiscoverer.position(self.mapYearToWidth(this.year) + 280,this.yPos + 165);
				textSize(16);
			}
		}
	}

	this.addDomElements = ()=>{
		// Uses p5js createP to create paragraph DOM elements to store values
		// which relate to the element
		this.pElement = createP();
		this.pAtomicMass = createP();
		this.pGroup = createP();
		this.pDiscoverer = createP();
		this.pYearDiscovered = createP();

		// draws the paragraph elements off screen first
		this.pElement.position(-1000,-1000);
		this.pAtomicMass.position(-1000,-1000);
		this.pGroup.position(-1000,-1000);
		this.pYearDiscovered.position(-1000,-1000);
		this.pDiscoverer.position(-1000,-1000);
	}

	// removes p dom elements
	this.removeDomElements = ()=>{
		this.pElement.remove();
		this.pAtomicMass.remove();
		this.pGroup.remove();
		this.pYearDiscovered.remove();
		this.pDiscoverer.remove();
	}
}

