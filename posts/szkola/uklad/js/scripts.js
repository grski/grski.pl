// this code is very dirty, but had no other choice
var lengthOfUnit = math.round(window.innerHeight/18);
var height = window.innerHeight-(window.innerHeight%lengthOfUnit);
var width = window.innerWidth-20-(window.innerWidth%lengthOfUnit);

var precision = 0.0030000003;
var prBtn = document.getElementById('prBtn'), prBtn2 = document.getElementById('prBtn2');
var prBtn3 = document.getElementById('prBtn3'), prBtn4 = document.getElementById('prBtn4');

var lastEquation;
var colors = ['darkblue', 'darkgoldenrod', 'darkgreen', 'darkmagenta',
              'darkolivegreen', 'darkorange', 'darkred', 'darkViolet',
              'deeppink', 'dodgerblue', 'fuchsia', 'gold', 'lawngreen',
              'lime', 'maroon', 'yellow', 'olive', 'purple'];
var plotNumber = 0;

var x0 = width/2; 
var y0 = height/2;

var c=document.getElementById("myCanvas");
c.width = width;
c.height = height;
var ctx=c.getContext("2d");

var numberOfUnitsOnXAxis = x0/lengthOfUnit;
var numberOfUnitsOnYAxis = y0/lengthOfUnit;
ctx.translate(x0+0.5,y0+0.5);

function makePlane(){
  ctx.strokeStyle = "#b3b3b3";
  ctx.beginPath();
  ctx.font = "15px Arial";
  for (i=0; i < numberOfUnitsOnXAxis; i++) {
    ctx.fillText(i, i*lengthOfUnit+5, 15); 
    ctx.fillText(-i, -i*lengthOfUnit+5, 15); 
    ctx.moveTo(i*lengthOfUnit,-y0);
    ctx.lineTo(i*lengthOfUnit,y0);
    ctx.moveTo(-i*lengthOfUnit, -y0);
    ctx.lineTo(-i*lengthOfUnit, y0);
    ctx.stroke();
  }
  ctx.closePath();
  ctx.beginPath();
  for (i=0; i < numberOfUnitsOnYAxis; i++){
    ctx.fillText(-i, 5, i*lengthOfUnit+15);
    ctx.fillText(i, 5, -i*lengthOfUnit+15);
    ctx.moveTo(-x0, i*lengthOfUnit);
    ctx.lineTo(x0, i*lengthOfUnit);
    ctx.moveTo(-x0, -i*lengthOfUnit);
    ctx.lineTo(x0, -i*lengthOfUnit);
    ctx.stroke();
  }
  ctx.closePath();
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.moveTo(-0, -y0);
  ctx.lineTo(-20, -y0+25);
  ctx.moveTo(-0, -y0);
  ctx.lineTo(20, -y0+25);
  ctx.moveTo(0, -y0);
  ctx.lineTo(0, y0);
  ctx.moveTo(-x0, 0);
  ctx.lineTo(x0, 0);
  ctx.lineTo(x0-20, 20);
  ctx.moveTo(x0,0);
  ctx.lineTo(x0-20, -20);
  ctx.stroke();
  ctx.closePath();
}

function draw(equation, p=0, q=0){
  var color = colors[plotNumber];
  plotNumber++;
  lastEquation = equation;
  var x,y, lastY;
  var scope = { x: 0 }
  ctx.beginPath();
  ctx.strokeStyle = color;
  for(i=-numberOfUnitsOnXAxis; i<numberOfUnitsOnXAxis; i+=precision){
    x = i*lengthOfUnit;
    scope.x = i;
    y = -math.eval(equation, scope)*lengthOfUnit;
    if(math.abs(lastY-y)>lengthOfUnit-1) ctx.moveTo(x,y)
    else ctx.lineTo(x+(p*lengthOfUnit),y-(q*lengthOfUnit));
    lastY = y;

  }
  ctx.stroke();
  ctx.closePath();
}

function ts(){
  var p = document.getElementById('vectorP').value;
  var q = document.getElementById('vectorQ').value;
  draw(lastEquation, p, q);
}

prBtn.onclick = function() {
  precision = 0.01500000003;
};
prBtn2.onclick = function() {
  precision = 0.00300000003;
};
prBtn3.onclick = function() {
  precision = 0.00200000003;
};
prBtn4.onclick = function() {
  precision = 0.00100000003;
};
