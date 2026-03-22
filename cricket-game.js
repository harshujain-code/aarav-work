const canvas = document.getElementById('cricket-canvas');
const ctx = canvas.getContext('2d');

// Game state
let game = {
    score: 0,
    balls: 30,
    wickets: 0,
    maxWickets: 3,
    speed: 1,
    running: false,
    ballInPlay: false,
    swung: false,
};

// Ball properties
let ball = {
    x: 0,
    y: 0,
    startY: 0,
    targetY: 0,
    progress: 0,
    landed: false,
    landX: 0,
    type: 'good', // good, short, yorker, wide
};

// Bat zone
const batZone = { yStart: 0, yEnd: 0 };

// Batsman state
let batsman = {
    x: 0,
    y: 0,
    swingAngle: 0,       // current bat angle (radians)
    swingTarget: 0,
    isSwinging: false,
    swingPhase: 'idle',  // idle, forward, hold, back
    swingTimer: 0,
};

// Animation
let animationId = null;
let resultTimeout = null;

// Resize canvas
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Update bat zone based on canvas size
    const h = rect.height;
    batZone.yStart = h * 0.65;
    batZone.yEnd = h * 0.78;

    // Position batsman
    batsman.x = rect.width / 2 + 18;
    batsman.y = h * 0.80;
}

// Difficulty buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        game.speed = parseFloat(btn.dataset.speed);
    });
});

// Start button
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('replay-btn').addEventListener('click', startGame);

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    game.score = 0;
    game.balls = 30;
    game.wickets = 0;
    game.running = true;
    game.ballInPlay = false;
    game.swung = false;

    updateScoreboard();
    showScreen('game-screen');
    resizeCanvas();
    hideResult();

    setTimeout(bowlBall, 800);
}

function updateScoreboard() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('balls').textContent = game.balls;
    document.getElementById('wickets').textContent = `${game.wickets}/${game.maxWickets}`;
}

function bowlBall() {
    if (!game.running) return;

    game.swung = false;
    game.ballInPlay = true;
    batsman.swingAngle = 0;
    batsman.isSwinging = false;
    batsman.swingPhase = 'idle';

    const cw = canvas.getBoundingClientRect().width;
    const ch = canvas.getBoundingClientRect().height;

    // Random ball type
    const r = Math.random();
    if (r < 0.5) ball.type = 'good';
    else if (r < 0.7) ball.type = 'short';
    else if (r < 0.85) ball.type = 'yorker';
    else ball.type = 'wide';

    // Starting position (bowler end)
    ball.startY = ch * 0.08;
    ball.x = cw / 2 + (Math.random() - 0.5) * 60;

    if (ball.type === 'wide') {
        ball.x = Math.random() > 0.5 ? cw * 0.15 : cw * 0.85;
    }

    // Target Y
    if (ball.type === 'short') ball.targetY = ch * 0.50;
    else if (ball.type === 'yorker') ball.targetY = ch * 0.82;
    else ball.targetY = ch * 0.72;

    ball.y = ball.startY;
    ball.progress = 0;
    ball.landed = false;

    hideResult();
    animate();
}

function animate() {
    if (!game.running) return;

    const cw = canvas.getBoundingClientRect().width;
    const ch = canvas.getBoundingClientRect().height;

    // Clear
    ctx.clearRect(0, 0, cw, ch);

    // Update batsman swing animation
    updateBatsmanSwing();

    // Draw pitch
    drawPitch(cw, ch);

    // Move ball
    ball.progress += 0.012 * game.speed;
    ball.y = ball.startY + (ball.targetY - ball.startY) * Math.min(ball.progress, 1);

    // Draw ball
    const ballRadius = 8;
    const shadow = ball.progress * 6;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y + shadow, ballRadius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Seam line
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius * 0.6, -0.5, 2.5);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Check if ball passed bat zone without swing
    if (ball.progress >= 1 && !game.swung) {
        game.ballInPlay = false;

        if (ball.type === 'wide') {
            showResult('Wide! +1', 'runs');
            game.score += 1;
        } else {
            // Didn't swing — dot ball or bowled
            const bowled = Math.random() < 0.15;
            if (bowled) {
                game.wickets++;
                showResult('Bowled! &#128165;', 'out');
            } else {
                showResult('Dot ball', 'dot');
            }
            game.balls--;
        }

        updateScoreboard();
        cancelAnimationFrame(animationId);

        if (game.wickets >= game.maxWickets || game.balls <= 0) {
            setTimeout(endGame, 1200);
        } else {
            setTimeout(bowlBall, 1200);
        }
        return;
    }

    animationId = requestAnimationFrame(animate);
}

function drawPitch(cw, ch) {
    // Grass
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(0, 0, cw, ch);

    // Pitch strip
    const pitchW = 60;
    ctx.fillStyle = '#c9a96e';
    ctx.fillRect(cw / 2 - pitchW / 2, ch * 0.05, pitchW, ch * 0.85);

    // Pitch lines
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cw / 2, ch * 0.05);
    ctx.lineTo(cw / 2, ch * 0.9);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crease lines
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;

    // Bowler crease
    ctx.beginPath();
    ctx.moveTo(cw / 2 - 40, ch * 0.12);
    ctx.lineTo(cw / 2 + 40, ch * 0.12);
    ctx.stroke();

    // Batting crease
    ctx.beginPath();
    ctx.moveTo(cw / 2 - 40, ch * 0.78);
    ctx.lineTo(cw / 2 + 40, ch * 0.78);
    ctx.stroke();

    // Stumps - bowler end
    drawStumps(cw / 2, ch * 0.10, 0.6);

    // Stumps - batsman end
    drawStumps(cw / 2, ch * 0.77, 1);

    // Green hit zone
    ctx.fillStyle = 'rgba(0, 255, 100, 0.12)';
    ctx.fillRect(0, batZone.yStart, cw, batZone.yEnd - batZone.yStart);

    // Zone border lines
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, batZone.yStart);
    ctx.lineTo(cw, batZone.yStart);
    ctx.moveTo(0, batZone.yEnd);
    ctx.lineTo(cw, batZone.yEnd);
    ctx.stroke();
    ctx.setLineDash([]);

    // Batsman
    drawBatsman(cw, ch);

    // Fielders (simple circles)
    const fielders = [
        { x: cw * 0.1, y: ch * 0.3 },
        { x: cw * 0.9, y: ch * 0.25 },
        { x: cw * 0.15, y: ch * 0.6 },
        { x: cw * 0.85, y: ch * 0.55 },
        { x: cw * 0.5, y: ch * 0.15 },
    ];
    fielders.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
    });
}

function updateBatsmanSwing() {
    if (!batsman.isSwinging) return;

    if (batsman.swingPhase === 'forward') {
        batsman.swingAngle += 0.25;
        if (batsman.swingAngle >= 2.2) {
            batsman.swingAngle = 2.2;
            batsman.swingPhase = 'hold';
            batsman.swingTimer = 8;
        }
    } else if (batsman.swingPhase === 'hold') {
        batsman.swingTimer--;
        if (batsman.swingTimer <= 0) {
            batsman.swingPhase = 'back';
        }
    } else if (batsman.swingPhase === 'back') {
        batsman.swingAngle -= 0.08;
        if (batsman.swingAngle <= 0) {
            batsman.swingAngle = 0;
            batsman.isSwinging = false;
            batsman.swingPhase = 'idle';
        }
    }
}

function triggerSwing() {
    batsman.isSwinging = true;
    batsman.swingPhase = 'forward';
    batsman.swingAngle = -0.3; // wind up slightly
}

function drawBatsman(cw, ch) {
    const bx = batsman.x;
    const by = batsman.y;

    ctx.save();
    ctx.translate(bx, by);

    // Legs
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-8, 18);
    ctx.lineTo(-6, 26);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(8, 18);
    ctx.lineTo(6, 26);
    ctx.stroke();

    // Pads (white)
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(-11, 10, 7, 14);
    ctx.fillRect(4, 10, 7, 14);

    // Shoes
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-9, 24, 7, 4);
    ctx.fillRect(3, 24, 7, 4);

    // Body (jersey)
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.ellipse(0, -8, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body outline
    ctx.strokeStyle = '#1a5276';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -8, 10, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Back arm (behind body)
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(6, -12);
    ctx.lineTo(14, -6);
    ctx.stroke();
    // Glove
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.arc(14, -6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Bat (attached to front arm, swings)
    ctx.save();
    ctx.translate(-6, -14); // shoulder pivot

    const angle = -1.2 + batsman.swingAngle; // resting angle behind, swings forward
    ctx.rotate(angle);

    // Front arm
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, 4);
    ctx.stroke();
    // Glove
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.arc(-8, 4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Bat handle
    ctx.strokeStyle = '#8b7355';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(-14, 12);
    ctx.stroke();

    // Bat blade
    ctx.save();
    ctx.translate(-14, 12);
    ctx.rotate(0.15);
    ctx.fillStyle = '#deb887';
    ctx.fillRect(-5, 0, 10, 28);
    // Bat edge highlight
    ctx.fillStyle = '#c9a96e';
    ctx.fillRect(-5, 0, 2, 28);
    // Bat toe
    ctx.beginPath();
    ctx.ellipse(0, 28, 5, 3, 0, 0, Math.PI);
    ctx.fillStyle = '#deb887';
    ctx.fill();
    ctx.restore();

    ctx.restore(); // shoulder pivot

    // Head
    ctx.fillStyle = '#f0c27a';
    ctx.beginPath();
    ctx.arc(0, -26, 8, 0, Math.PI * 2);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(0, -28, 9, Math.PI, 0);
    ctx.fill();
    // Helmet grill
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i += 3) {
        ctx.beginPath();
        ctx.moveTo(i, -22);
        ctx.lineTo(i, -18);
        ctx.stroke();
    }

    ctx.restore();
}

function drawStumps(x, y, scale) {
    const gap = 5 * scale;
    const h = 14 * scale;
    ctx.fillStyle = '#f5e6ca';
    for (let i = -1; i <= 1; i++) {
        ctx.fillRect(x + i * gap - 1, y - h / 2, 2, h);
    }
    // Bails
    ctx.fillStyle = '#e6d5b8';
    ctx.fillRect(x - gap - 1, y - h / 2 - 2, gap * 2 + 2, 2);
}

// Player input — click/tap to swing
canvas.addEventListener('click', handleSwing);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleSwing();
}, { passive: false });

function handleSwing() {
    if (!game.ballInPlay || game.swung) return;

    game.swung = true;
    game.ballInPlay = false;
    triggerSwing();
    // Let swing animation play out before stopping
    setTimeout(() => cancelAnimationFrame(animationId), 600);

    const ch = canvas.getBoundingClientRect().height;

    // Check if ball is in the hit zone
    const inZone = ball.y >= batZone.yStart && ball.y <= batZone.yEnd;
    const closeness = inZone
        ? 1 - Math.abs(ball.y - (batZone.yStart + batZone.yEnd) / 2) / ((batZone.yEnd - batZone.yStart) / 2)
        : 0;

    if (ball.type === 'wide') {
        // Swung at a wide — it becomes a legal ball
        if (inZone) {
            const runs = getRunsFromCloseness(closeness);
            applyRuns(runs);
        } else {
            showResult('Missed! Dot ball', 'miss');
        }
        game.balls--;
    } else if (!inZone) {
        // Missed — could be out
        const tooEarly = ball.y < batZone.yStart;
        if (tooEarly) {
            showResult('Too early! Miss', 'miss');
        } else {
            // Hit wicket or missed
            const out = Math.random() < 0.4;
            if (out) {
                game.wickets++;
                showResult('Caught! &#128075;', 'out');
            } else {
                showResult('Missed!', 'miss');
            }
        }
        game.balls--;
    } else {
        // Good contact!
        const runs = getRunsFromCloseness(closeness);
        applyRuns(runs);
        game.balls--;
    }

    updateScoreboard();

    if (game.wickets >= game.maxWickets || game.balls <= 0) {
        setTimeout(endGame, 1200);
    } else {
        setTimeout(bowlBall, 1200);
    }
}

function getRunsFromCloseness(closeness) {
    const r = Math.random();
    if (closeness > 0.85) {
        // Perfect timing
        if (r < 0.35) return 6;
        if (r < 0.7) return 4;
        return Math.ceil(Math.random() * 3);
    } else if (closeness > 0.5) {
        if (r < 0.15) return 6;
        if (r < 0.45) return 4;
        return Math.ceil(Math.random() * 3);
    } else {
        if (r < 0.05) return 4;
        if (r < 0.4) return Math.ceil(Math.random() * 2);
        return 1;
    }
}

function applyRuns(runs) {
    game.score += runs;
    if (runs === 6) {
        showResult('SIX! &#128293;&#128293;&#128293;', 'six');
    } else if (runs === 4) {
        showResult('FOUR! &#127942;', 'four');
    } else {
        showResult(`${runs} run${runs > 1 ? 's' : ''}`, 'runs');
    }
}

function showResult(text, type) {
    const el = document.getElementById('hit-result');
    el.innerHTML = text;
    el.className = 'hit-result show ' + type;
    clearTimeout(resultTimeout);
    resultTimeout = setTimeout(hideResult, 1000);
}

function hideResult() {
    const el = document.getElementById('hit-result');
    el.className = 'hit-result';
}

function endGame() {
    game.running = false;
    cancelAnimationFrame(animationId);

    document.getElementById('final-score').textContent = game.score;

    let title, msg;
    if (game.score >= 100) {
        title = 'CENTURY! &#127942;';
        msg = 'What a legendary innings, Ivaann!';
    } else if (game.score >= 50) {
        title = 'Half Century! &#11088;';
        msg = 'Brilliant batting, champion!';
    } else if (game.score >= 25) {
        title = 'Good Effort! &#128170;';
        msg = 'Nice knock! Try for a bigger score!';
    } else {
        title = 'Game Over!';
        msg = 'Keep practicing, you\'ll smash it next time!';
    }

    document.getElementById('end-title').innerHTML = title;
    document.getElementById('end-message').textContent = msg;

    showScreen('end-screen');
}

// Handle resize
window.addEventListener('resize', () => {
    if (game.running) resizeCanvas();
});
