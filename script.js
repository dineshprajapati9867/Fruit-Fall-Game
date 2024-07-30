const score = document.getElementById("score");
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
console.log(canvas.width);
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start-button");
const timer = document.getElementById("timer");
const coverScreen = document.querySelector(".cover-screen");
const overText = document.getElementById("over-text");
const result = document.getElementById("result");

let fruits = [];
let particles = [];
let points = 0;
const fruitsList = ["apple", "burger", "coffee", "ice", "pizza", "banna"];
events = {
  mouse: {
    down: "mousedown",
    move: "mousemove",
  },
  touch: {
    down: "touchstart",
    move: "touchmove",
  },
};

let deviceType = "";
let interval, randomCreationTime, timerId;

const isTouchDevice = () => {
  try {
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};

const generateRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

function Particle(x, y, size, color, speedX, speedY) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.color = color;
  this.speedX = speedX;
  this.speedY = speedY;
  this.opacity = 1;

  this.update = () => {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.02;
    if (this.opacity <= 0) {
      this.opacity = 0;
    }
  };

  this.draw = () => {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  };
}

function Fruit(image, x, y, width, name) {
  this.image = new Image();
  this.image.src = image;
  this.x = x;
  this.y = y;
  this.speed = 1;
  this.width = width;
  this.clicked = false;
  this.complete = false;
  this.name = name;

  this.update = () => {
    this.y += this.speed;
    if (this.clicked) {
      this.createParticles();
      this.complete = true;
    }
    if (!this.complete && this.y + this.width > canvas.height) {
      this.complete = true;
    }
  };

  this.draw = () => {
    if (!this.clicked) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.width);
    }
  };

  this.compare = (mouseX, mouseY) => {
    return (
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.width
    );
  };

  this.createParticles = () => {
    for (let i = 0; i < 200; i++) {
      let size = 1;
      let speedX = generateRandomNumber(-1, 1);
      let speedY = generateRandomNumber(-1, 1);
      let color = "rgb(250,250,250)";
      particles.push(
        new Particle(
          Math.min(
            Math.max(this.x + generateRandomNumber(0, this.width), 0),
            canvas.width
          ),
          Math.min(
            Math.max(this.y + generateRandomNumber(0, this.width), 0),
            canvas.height
          ),
          size,
          color,
          speedX,
          speedY
        )
      );
    }
  };
}

function createRandomFruit() {
  if (fruits.length < 10) {
    let randomFruit =
      fruitsList[generateRandomNumber(0, fruitsList.length - 1)];
    const randomImage = `${randomFruit}.png`;
    const randomX = generateRandomNumber(0, canvas.width - 100);
    const fruitWidth = 50;
    let fruit = new Fruit(randomImage, randomX, 0, fruitWidth, randomFruit);
    fruits.push(fruit);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fruits = fruits.filter((fruit) => !fruit.complete);
  for (const fruit of fruits) {
    fruit.update();
    fruit.draw();
  }
  for (const particle of particles) {
    particle.update();
    particle.draw();
  }
  particles = particles.filter((particle) => particle.opacity > 0);
  requestAnimationFrame(animate);
}
animate();
isTouchDevice();

canvas.addEventListener(events[deviceType].down, function (e) {
  let clickX =
    (isTouchDevice() ? e.touches[0].pageX : e.pageX) - canvas.offsetLeft;
  let clickY =
    (isTouchDevice() ? e.touches[0].pageY : e.pageY) - canvas.offsetTop;
  fruits.forEach(function (fruit) {
    let check = fruit.compare(clickX, clickY);
    if (check && !fruit.clicked) {
      fruit.clicked = true;
      if (fruit.name === "apple" || fruit.name === "banna") {
        points += 10;
      } else {
        points -= 5;
      }
      score.innerHTML = `SCORE : ${points}`;
    }
  });
});

canvas.addEventListener(events[deviceType].move, function (e) {
  let mouseX =
    (isTouchDevice() ? e.touches[0].pageX : e.pageX) - canvas.offsetLeft;
  let mouseY =
    (isTouchDevice() ? e.touches[0].pageY : e.pageY) - canvas.offsetTop;
  let cursorStyle = "default";
  fruits.forEach(function (fruit) {
    if (fruit.compare(mouseX, mouseY) && !fruit.clicked) {
      cursorStyle = "pointer";
    }
  });
  canvas.style.cursor = cursorStyle;
});

startButton.addEventListener("click", () => {
  let timeLeft = 30;
  clearInterval(timerId);
  clearInterval(interval);
  fruits = [];
  points = 0;
  score.innerHTML = `SCORE : ${points}`;

  canvas.classList.remove("hide");
  coverScreen.classList.add("hide");
  overText.classList.add("hide");
  createRandomFruit();
  randomCreationTime = 1.3;
  interval = setInterval(createRandomFruit, randomCreationTime * 1000);
  score.classList.remove("hide");

  timer.innerHTML = timeLeft; // Initialize timer display
  timerId = setInterval(() => {
    if (timeLeft < 0) {
      clearInterval(timerId);
      clearInterval(interval); // Stop fruit creation
      coverScreen.classList.remove("hide");
      canvas.classList.add("hide");
      overText.classList.remove("hide");
      result.innerText = `Final Score: ${points}`;
      if (points >= 100) {
        overText.innerText = "You Won!";
      } else {
        overText.innerText = "You Lost!";
      }
      startButton.innerText = "Restart Game";
      score.classList.add("hide");
    } else {
      timer.innerHTML = timeLeft;
      timeLeft--;
    }
  }, 1000);
});
