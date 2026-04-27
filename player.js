// ── Player State ──
window.playerStats = {
    active: false,
    pathLength: 0,
    stepsExplored: 0,
    startTime: 0,
    timeTaken: 0,
    currentRow: 0,
    currentCol: 0,
    finished: false
};

let liveTimerInterval = null;

function startPlayerTurn() {
    const ps = window.playerStats;
    ps.active = true;
    ps.pathLength = 0;
    ps.stepsExplored = 0;
    ps.timeTaken = 0;
    ps.finished = false;
    ps.startTime = performance.now();

    const start = window.gameGrid.getStartPos();
    ps.currentRow = start.row;
    ps.currentCol = start.col;

    // Reset path tracking in grid
    window.gameGrid.playerPath = [[start.row, start.col]];
    window.gameGrid.playerCurrent = [start.row, start.col];

    // Update status
    setStatus('⏳', 'Move to the END tile (E)', '');

    // Enable run button text
    const btn = document.getElementById('runBtn');
    if (btn) { btn.disabled = true; document.getElementById('runBtnText').textContent = 'FINISH YOUR PATH FIRST'; }

    // Start live timer
    clearInterval(liveTimerInterval);
    liveTimerInterval = setInterval(() => {
        if (!ps.active) return;
        const elapsed = Math.round((performance.now() - ps.startTime) / 1000);
        const el = document.getElementById('liveTime');
        if (el) el.textContent = elapsed + 's';
    }, 500);

    // Redraw with player
    window.gameGrid.render();
    window.gameGrid.drawPlayerOnTop();
}

function stopPlayerTurn() {
    const ps = window.playerStats;
    ps.active = false;
    ps.timeTaken = Math.round(performance.now() - ps.startTime);
    ps.finished = true;
    clearInterval(liveTimerInterval);
    document.getElementById('liveTime').textContent = ps.timeTaken + 'ms';
}

function setStatus(icon, text, cls) {
    const box = document.getElementById('statusBox');
    const iconEl = document.getElementById('statusIcon');
    const textEl = document.getElementById('statusText');
    if (box) { box.className = 'status-box ' + cls; }
    if (iconEl) iconEl.textContent = icon;
    if (textEl) textEl.textContent = text;
}

// ── Keyboard movement ──
document.addEventListener('keydown', (e) => {
    const ps = window.playerStats;
    if (!ps.active || !window.gameGrid) return;

    let nr = ps.currentRow, nc = ps.currentCol;

    if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W') nr--;
    else if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') nr++;
    else if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') nc--;
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') nc++;
    else return;

    e.preventDefault();

    if (!window.gameGrid.isWalkable(nr, nc)) return;

    ps.currentRow = nr;
    ps.currentCol = nc;
    ps.stepsExplored++;

    // Track path: add if not already the last position
    const last = window.gameGrid.playerPath[window.gameGrid.playerPath.length - 1];
    if (!last || last[0] !== nr || last[1] !== nc) {
        window.gameGrid.playerPath.push([nr, nc]);
        ps.pathLength++;
    }

    window.gameGrid.playerCurrent = [nr, nc];

    // Update live stats UI
    document.getElementById('liveSteps').textContent = ps.stepsExplored;
    document.getElementById('miniPath').textContent = ps.pathLength;
    document.getElementById('miniSteps').textContent = ps.stepsExplored;

    // Redraw
    window.gameGrid.render();
    window.gameGrid.drawPlayerOnTop();

    // Check if player reached END
    if (window.gameGrid.map[nr][nc] === TILE.END) {
        stopPlayerTurn();
        setStatus('✅', 'Path complete! Running algorithms...', 'status-done');

        const btn = document.getElementById('runBtn');
        if (btn) {
            btn.disabled = false;
            document.getElementById('runBtnText').textContent = 'RUN ALGORITHMS ▶';
        }

        // Hide canvas hint
        const hint = document.getElementById('canvasHint');
        if (hint) hint.style.display = 'none';
    }
});
