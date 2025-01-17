const canvas = document.getElementById('root')
const context = canvas.getContext('2d');
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    // Phương thức cộng vector
    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    
    // Phương thức trừ vector
    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }
    
    // Phương thức nhân vector với một số
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }
    divide(scalar) {
        if (scalar !== 0) {
            return new Vector(this.x / scalar, this.y / scalar);
        } else {
            throw new Error("Division by zero is not allowed.");
        }
    }
    
    // Phương thức tính độ dài của vector
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    // Phương thức chuẩn hóa vector (độ dài = 1)
    normalize() {
        let magnitude = this.magnitude();
        return new Vector(this.x / magnitude, this.y / magnitude);
    }
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
}

let circleSize = 100;
let circleCenter = new Vector(canvas.width / 2,canvas.height / 2)
// Drawing functions
function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawCircle({x, y, size, color,start=0,end=Math.PI*2, stroke}) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, size, start, end);
    context.lineWidth = stroke;
    stroke && context.stroke()
    stroke || context.fill(); 
}


// Game logic
function radians(deg){
    return deg*Math.PI/180
}
function deg(radians){
    return radians*180/Math.PI
}
let SPINNING_SPEED = 0
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256); 
    const b = Math.floor(Math.random() * 256);

    return `rgb(${r}, ${g}, ${b})`;
}
class Ball{
    constructor(x, y, velocity){
        this.pos = new Vector(x,y)
        this.size=5
        this.gravity=0.1
        this.velocity= velocity
        this.is_in=true
        this.color = getRandomColor()
        
    }
    draw(){
        drawCircle({x:this.pos.x, y:this.pos.y, size:10, color:this.color})
    }
    update(start_angle, end_angle){
        
        this.velocity.y+=this.gravity
        this.pos = this.pos.add(this.velocity)
        let dist = this.pos.subtract(circleCenter).magnitude()
        if(dist + this.size>circleSize){
            if(!this.isBallOut(start_angle,end_angle)){
                this.is_in=false
            }
            if(this.is_in){
                let d = this.pos.subtract(circleCenter)
                let d_norm = Math.hypot(d.x,d.y)
                let d_unit= d.divide(d_norm)
                this.pos = circleCenter.add(d_unit.multiply((circleSize - this.size)))
                let t = new Vector(-d.y, d.x)
                let v_t = t.multiply((this.velocity.dot(t)/t.dot(t)))
                this.velocity = v_t.multiply(2).subtract(this.velocity)
                this.velocity = this.velocity.add(t.multiply(radians(SPINNING_SPEED)/circleSize))
            }
        }
    }
    isBallOut(start, end){
        let dx = this.pos.x - circleCenter.x
        let dy = this.pos.y - circleCenter.y
        let ball_angle = Math.atan2(dy, dx)
        let end_angle = end % (2 * Math.PI)
        let start_angle = start % (2 * Math.PI)
        
        if (start_angle > end_angle){
            end_angle += 2 * Math.PI
        }
        if (((start_angle <= ball_angle) && (ball_angle <= end_angle)) || 
        (((start_angle <= ball_angle + 2 * Math.PI)&&(ball_angle + 2 * Math.PI <= end_angle)))){
            return true
        }else{
            return false
        }
    }
}
let angle = 0
function randomVector(min, max) {
    return new Vector(Math.random() * (max - min) + min,Math.random() * (max - min) + min)
}

// /const ball = new Ball(circleCenter.x, circleCenter.y)
const balls = [new Ball(circleCenter.x, circleCenter.y-50, randomVector(-1,1))]
function update() {
    balls.forEach((ball, index) => {
        if((ball.pos.x > canvas.width || ball.pos.x <0)||(ball.pos.y > canvas.height || ball.pos.y < 0)){
            balls.splice(index,1)
            balls.push(new Ball(circleCenter.x, circleCenter.y-50, randomVector(-1,1)))
            balls.push(new Ball(circleCenter.x, circleCenter.y-50, randomVector(-1,1)))
        }
        ball.update(radians(angle),radians(angle+300))
    });
    angle+=SPINNING_SPEED
}
function render() {
    drawRect(0, 0, canvas.width, canvas.height, '#fff');
    balls.forEach(ball => {
        ball.draw()
    });
    drawCircle({x:circleCenter.x, y:circleCenter.y, size:circleSize, stroke:5, start:radians(angle), end:radians(angle+300)});
}

// Game loop
function gameLoop() {
    update();   
    render();
    requestAnimationFrame(gameLoop);
}



gameLoop();
const range = document.getElementById('range')
range.onchange = (e)=>{
    circleSize = e.target.value
    
}
const speed = document.getElementById('speed')
speed.onclick = (e)=>{
    SPINNING_SPEED = 0.5
    
}
const stop = document.getElementById('stop')
stop.onclick = (e)=>{
    SPINNING_SPEED = 0
    
}
