/* This code does not work as intended, I was sadly unable to add this
  to my p5js canvas as the formatting would get messed up and it would appear below everything
  instead of part of the main container itself. but I hope I can still get a few marks
  for the code and attempt */

function CreateEmbassyMap(){
  this.name = 'Location of Embassies in London';
  this.id = 'embassy';
  let embassies,flags;
  let p, myMap;
  var marginSize = 35;
  const mappa = new Mappa('Leaflet');

  this.preload = ()=>{
    var self = this;
    this.data = loadTable(
      './data/embassy-data/embassy.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded = true;
      });
    flags = [];
    flags.push(loadImage('images/albania.jpeg'));
    flags.push(loadImage('images/algeria.webp'));
    flags.push(loadImage('images/angola.png'));
    flags.push(loadImage('images/antigua.png'));
    flags.push(loadImage('images/argentina.webp'));
    flags.push(loadImage('images/armenia.webp'));
    flags.push(loadImage('images/australia.webp'));
    flags.push(loadImage('images/austria.svg'));
    flags.push(loadImage('images/azerbaijan.svg'));
    flags.push(loadImage('images/bahamas.webp'));
    flags.push(loadImage('images/bangladesh.png'));
    flags.push(loadImage('images/barbados.webp'));
    flags.push(loadImage('images/burundi.webp'));
    flags.push(loadImage('images/canada.webp'));
    flags.push(loadImage('images/china.webp'));
    flags.push(loadImage('images/france.png'));
    flags.push(loadImage('images/germany.webp'));
    flags.push(loadImage('images/iceland.webp'));
    flags.push(loadImage('images/india.webp'));
    flags.push(loadImage('images/iran.webp'));
    flags.push(loadImage('images/italy.webp'));
    flags.push(loadImage('images/japan.jpeg'));
    flags.push(loadImage('images/kazakhstan.webp'));
    flags.push(loadImage('images/newzealand.webp'));
    flags.push(loadImage('images/northkorea.webp'));
    flags.push(loadImage('images/russia.webp'));
    flags.push(loadImage('images/southafrica.webp'));
    flags.push(loadImage('images/southkorea.webp'));
    flags.push(loadImage('images/ukraine.webp'));
    flags.push(loadImage('images/unitedstates.webp'));
    flags.push(loadImage('images/zimbabwe.webp'));
  }
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
    numXTickLabels: 30,
    numYTickLabels: 20,
  };
  // All the map options put into a single object
  const options = {
    lat: 51.509865,
    lng: -0.118092,
    zoom: 11,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
  }
  this.setup = ()=>{

    // Create a tile map with the options declared
    myMap = mappa.tileMap(options); 
    myMap.overlay(c);
    embassies = [];

    // New objects created with new keyword, data from csv file of longitude
    // latitude and country are properties of the objects created
    for (let i = 0; i < this.data.getRowCount(); i++) {
      embassies.push(new Embassy(
      this.data.getNum(i,'Longitude'),
      this.data.getNum(i,'Latitude'),
      this.data.getString(i,'Embassy')));
    }
    // paragraph element to display country name
    p = createP('Embassy');
    p.elt.style.display = "inline";
  }
  this.draw = ()=>{
    clear();
    fill(255,0,0,150);
    noStroke();
    // each objects' method is called here
    for (let i = 0; i < this.data.getRowCount(); i++) {
      embassies[i].draw();
      embassies[i].mouseOver(i);
    }
  }

  // constructor function to create blueprint for an object, longitude latitude
  // and country are all parameters which are inputted into it
  function Embassy(long,lat,country){
    this.country = country;
    this.draw = function(){
      // longitude and latitude are mapped to the canvas
      coords = myMap.latLngToPixel(long,lat);
      ellipse(coords.x,coords.y,1.5 *  (myMap.getZoom() * 1.2));
    }
    this.mouseOver = function(index){
      // If the user is too zoomed out, then they will be unable to hover over any
      // countries and retrieve information, this information only becomes available
      // when teh map zoone is greater than 9
      let distance = dist(mouseX,mouseY,coords.x,coords.y);
      if (distance < (1.5 * (myMap.getZoom() * 1.2)/2) && (myMap.getZoom() > 9)) {
        p.elt.innerText = 'Embassy of ' + this.country;
        flags[index].resize(128,80);
        image(flags[index],width - flags[index].width,0);        
        console.log("hello");
      }
    }
  }
}