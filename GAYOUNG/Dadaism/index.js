const canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d");
const background = new Image();
background.src = "mona-lisa.jpeg";

let pos = {
  drawable: false,
  X: -1,
  Y: -1,
};

// Make sure the image is loaded first otherwise nothing will draw.
background.onload = function () {
  canvas.width = background.width;
  canvas.height = background.height;

  ctx.drawImage(background, 0, 0);

  //   $("#canvas").addClass("small");
  $("#background").attr("height", window.innerWidth);
  $("#background").attr("width", window.innerHeight);

  canvas.addEventListener("mousedown", listener);
  canvas.addEventListener("mousemove", listener);
  canvas.addEventListener("mouseup", listener);
  canvas.addEventListener("mouseout", listener);
  canvas.addEventListener("mouseover", listener);
};

function listener(event) {
  switch (event.type) {
    case "mousedown":
      initDraw(event);
      break;
    case "mousemove":
      if (pos.drawable) draw(event);
      break;
    case "mouseup":
      finishDraw();
      break;
    case "mouseover":
      moveClose();
      break;
    case "mouseout":
      moveFar();
      break;
  }
}

function moveClose() {
  console.log("hover");
  $("#canvas").removeClass("small");
  $("#canvas").addClass("large");
  $("#background").removeClass("background");
  $("#background").addClass("background-large");
}

function moveFar() {
  finishDraw();
  console.log("mouseout");
  $("#canvas").removeClass("large");
  $("#canvas").addClass("small");

  $("#background").removeClass("background-large");
  $("#background").addClass("background");
}

function getMousePos(event) {
  var rect = canvas.getBoundingClientRect();
  console.log(rect);
  return {
    x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
    y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
  };
}

function initDraw(event) {
  console.log("draw");
  ctx.beginPath();
  pos.drawable = true;
  let coors = getMousePos(event);
  pos.X = coors.x;
  pos.Y = coors.y;
  ctx.moveTo(pos.X, pos.Y);
}

function draw(event) {
  let coors = getMousePos(event);
  ctx.lineTo(coors.x, coors.y);
  pos.X = coors.X;
  pos.Y = coors.Y;
  ctx.stroke();
}

function finishDraw() {
  pos.drawable = false;
  pos.X = -1;
  pos.Y = -1;
}

function getPosition(event) {
  let x = event.pageX - canvas.offserLeft;
  let y = event.pageY - canvas.offsetRight;
  return { X: x, Y: y };
}

//***** *****/