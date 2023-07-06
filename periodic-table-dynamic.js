function PeriodicTableDynamic(){
	this.name = 'First 20 Elements of the Periodic Table, Dynamic object creation';
	this.id = 'periodic-table-dynamic';

	this.xAxisLabel = 'Year Discovered';
	this.yAxisLabel = '';

	// variables to store arrays
	const marginSize = 35;
	
	// text dom elements to provide information to the user, declared here as 
	// needs to be accessed by destroy function
	// // removes all the created DOM elements when switching gallery items
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

		// array to store all the elements from the csv file and for new elements
		// that you would like to add
		this.elements = [];

		// array to store the colors of the groups
		this.keyColor = [color(0,0,0),color(255,0,0),color(0,0,255),color(100,100,100),
											color(100,200,200),color(255,100,50),color(50,50,200)];
		
		// pushes the data from csv file to the elements array by creating
		// new objects 
		for(let i = 0; i < this.data.getRowCount();i++){
			this.elements.push({element: this.data.getString(i,'Element'),
														symbol: this.data.getString(i, 'Symbol'),
														atomicMass: this.data.getNum(i, 'Atomic Mass'),
														group: this.data.getString(i, 'Group'),
														discoverer: this.data.getString(i, 'Discoverer'),
														yearDiscovered: this.data.getNum(i, 'Year discovered'),
														color: '',
														yPos: 0});
			
			// This is wheree the colours and y position are decided depending
			// on the elements group
			this.findGroup(i);
		}
		// used for mapping on x axis
		this.startYear = 1640;
		this.endYear = 1900;

		// adds the dom elements such as p, div, button
		this.addDomElements();
	}
	this.draw = ()=>{

		drawAxis(this.layout);
		drawAxisLabels(this.xAxisLabel,this.yAxisLabel,this.layout);
		textSize(12);
		textAlign(RIGHT);
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

		// draws the ellipses and text onto the canvas with desired colour
		for (let i = 0; i < this.elements.length; i++) {
			fill(this.elements[i].color);

			ellipse(this.mapYearToWidth(this.elements[i].yearDiscovered),
				this.elements[i].yPos, 20);

			text(this.elements[i].symbol,
				this.mapYearToWidth(this.elements[i].yearDiscovered),
				this.elements[i].yPos - 20);
		}
		
		// mouseOver function is called
		this.mouseOver();

		// value is being displayed to the user before they submit their element
		this.div5.elt.innerHTML = 'Discovery year: ' + this.inputYear.value();
		this.div6.elt.innerHTML = 'Atomic Mass: ' + this.inputMass.value()/(10 ** 3);

		// When the submitBtn is pressed, new element is pusnhed onto array
		// it is then assigned colour and ypos depending on group 
		this.submitBtn.mousePressed(()=> {
			this.elements.push({element: this.elementName.value(),
														symbol: this.symbolName.value(),
														atomicMass: this.inputMass.value() / (10 ** 3),
														group: this.selectGroup.value(),
														discoverer: this.discovererName.value(),
														yearDiscovered: this.inputYear.value(),
														color: '',
														yPos: 0});

			for (let i = 0; i < this.elements.length; i++) {
				// The colours and y pos are again calculated on new array
				this.findGroup(i);
			}
		});

		// removes an element frm the array
		this.removeBtn.mousePressed(()=>{
				this.elements.pop();
		})
	}

	this.mapYearToWidth = (value) => map(value,this.startYear,this.endYear,
									this.layout.leftMargin,   // Draw left-to-right from margin.
									this.layout.rightMargin);

	// gets distance between mouseX,mouseY and the target ellipse, 
	// if its within 15 pixels then drawStats is called
	this.mouseOver = ()=>{
		for (let i = 0; i < this.elements.length; i++) {
			// local variable to calculate distance between mouse and ellipse
			let distance = dist(mouseX,mouseY,
					this.mapYearToWidth(this.elements[i].yearDiscovered),this.elements[i].yPos);

			if (distance < 15) {
					this.drawStats(i);
			}
		}
	}
		
	// draws stats of the element beneath it, takes index as an argument
	this.drawStats = (index)=>{
		textSize(12);
		// handles the name of the element
		this.pElement.elt.innerHTML = 'Element: ' + this.elements[index].element;
		this.pElement.position(
			this.mapYearToWidth(this.elements[index].yearDiscovered) + 280,
			this.elements[index].yPos + 5);

		// displays the atomic mass
		this.pAtomicMass.elt.innerHTML = 'Atomic Mass: ' + this.elements[index].atomicMass;
		this.pAtomicMass.position(
			this.mapYearToWidth(this.elements[index].yearDiscovered) + 280,
			this.elements[index].yPos + 55);

		// displays the group
		this.pGroup.elt.innerHTML = 'Group: ' + this.elements[index].group;
		this.pGroup.position(
			this.mapYearToWidth(this.elements[index].yearDiscovered) + 280,
			this.elements[index].yPos + 85);

		// displays the year discovereed
		this.pYearDiscovered.elt.innerHTML = 'Year Discovered: ' + this.elements[index].yearDiscovered;
		this.pYearDiscovered.position(
			this.mapYearToWidth(this.elements[index].yearDiscovered) + 280,
			this.elements[index].yPos + 115);

		// displays the discoverer name
		this.pDiscoverer.elt.innerHTML = 'Discoverer: ' + this.elements[index].discoverer;
		this.pDiscoverer.position(
			this.mapYearToWidth(this.elements[index].yearDiscovered) + 280,
			this.elements[index].yPos + 165);

		textSize(16);
	}
	// function which determines the colour and y position of element
	// based on its group
	this.findGroup = (index)=>{
		if (this.elements[index].group == 'Nonmetal') {
				this.elements[index].color = this.keyColor[0];
				this.elements[index].yPos = 50;
		} else if (this.elements[index].group == 'Noble Gas') {
				this.elements[index].color = this.keyColor[1];
				this.elements[index].yPos = 120;
		} else if (this.elements[index].group == 'Alkali Metal'){
				this.elements[index].color = this.keyColor[2];
				this.elements[index].yPos = 190;
		} else if (this.elements[index].group == 'Alkaline'){
				this.elements[index].color = this.keyColor[3];
				this.elements[index].yPos = 260;
		} else if (this.elements[index].group == 'Semimetal'){
				this.elements[index].color = this.keyColor[4];
				this.elements[index].yPos = 330;
		} else if (this.elements[index].group == 'Halogen'){
				this.elements[index].color = this.keyColor[5];
				this.elements[index].yPos = 400;
		} else {
				this.elements[index].color = this.keyColor[6];
				this.elements[index].yPos = 470;
		}
	}
	
	this.addDomElements = ()=>{
		// creates paragraph elements to display element information on hover
		this.pElement = createP();
		this.pAtomicMass = createP();
		this.pGroup = createP();
		this.pDiscoverer = createP();
		this.pYearDiscovered = createP();

		// moved off screen when you switch to this gallery option
		this.pElement.position(-1000,-1000);
		this.pAtomicMass.position(-1000,-1000);
		this.pGroup.position(-1000,-1000);
		this.pYearDiscovered.position(-1000,-1000);
		this.pDiscoverer.position(-1000,-1000);

		// select input created and loaded with options from the groups array
		// div created below it to label the select box
		this.selectGroup = createSelect();
		for (let i = 0; i < this.groups.length; i++) {
				this.selectGroup.option(this.groups[i]);
		}
		this.selectGroup.position(500, this.layout.plotHeight() + 140);
		this.div1 = createDiv('Group: ');
		this.div1.position(440,this.layout.plotHeight() + 140);

		// input box created which takes in the element name, div used to
		// label what the textbox is for
		this.elementName = createInput();
		this.elementName.position(500,this.layout.plotHeight() + 165);
		this.div2 = createDiv('Name: ');
		this.div2.position(440,this.layout.plotHeight() + 165);

		// input box created which takes in the symbol name
		this.symbolName = createInput();
		this.symbolName.position(500,this.layout.plotHeight() + 190);
		this.div3 = createDiv('Symbol: ');
		this.div3.position(430,this.layout.plotHeight() + 190);

		// input box created which takes in the discoverers name
		this.discovererName = createInput();
		this.discovererName.position(500,this.layout.plotHeight() + 215);
		this.div4 = createDiv('Discoverer: ');
		this.div4.position(410,this.layout.plotHeight() + 215);
		
		// slider created which takes in the input year from 1650 to 1890
		this.inputYear = createSlider(1650,1890);
		this.inputYear.position(500,this.layout.plotHeight() + 240);
		this.div5 = createDiv();
		this.div5.position(345,this.layout.plotHeight() + 240);

		// slider created which takes in the atomic mass from 0 to 300,
		// this number 300,000 is later divided by 10^3 to give 3 decimal places
		this.inputMass = createSlider(0, 100000);
		this.inputMass.position(500,this.layout.plotHeight() + 265);
		this.div6 = createDiv('Atomic Mass: ');
		this.div6.position(340,this.layout.plotHeight() + 265);

		// interaction submitBtns created to add or remove an element from the graph
		this.submitBtn = createButton('Submit');
		this.submitBtn.position(400,this.layout.plotHeight() + 300);

		this.removeBtn = createButton('Remove');
		this.removeBtn.position(500,this.layout.plotHeight() + 300);
	}
	// removes dom elements so that they dont show when switching
	// gallery items
	this.removeDomElements = ()=>{
		this.pElement.remove();
		this.pAtomicMass.remove();
		this.pGroup.remove();
		this.pYearDiscovered.remove();
		this.pDiscoverer.remove();
		this.selectGroup.remove();
		this.elementName.remove();
		this.symbolName.remove();
		this.inputMass.remove();
		this.discovererName.remove();
		this.inputYear.remove();
		this.submitBtn.remove();
		this.div1.remove();
		this.div2.remove();
		this.div3.remove();
		this.div4.remove();
		this.div5.remove();
		this.div6.remove();
		this.removeBtn.remove();
	}
}

