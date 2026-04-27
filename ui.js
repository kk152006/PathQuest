// ── Global State ──
window.playerName       = 'Player';
window.currentDifficulty = 'Medium';
window.lastResults       = null;

// ── Screen transitions ──
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('screen-active');
    });
    const target = document.getElementById(id);
    if (target) target.classList.add('screen-active');
}

// ── LOGIN ──
function handleLogin() {
    const input = document.getElementById('loginNameInput').value.trim();
    const err   = document.getElementById('loginError');

    if (!input) {
        err.textContent = 'Please enter your name to continue.';
        document.getElementById('loginNameInput').focus();
        return;
    }
    if (input.length < 2) {
        err.textContent = 'Name must be at least 2 characters.';
        return;
    }
    err.textContent = '';
    window.playerName = input;
    document.getElementById('playerNameDisplay').textContent = input;
    showScreen('screen-difficulty');
}

// Allow Enter key on login
document.addEventListener('DOMContentLoaded', () => {
    const inp = document.getElementById('loginNameInput');
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });

    // Run button
    const runBtn = document.getElementById('runBtn');
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            if (!window.playerStats.finished) {
                alert('Please reach the END tile first!');
                return;
            }
            const selected = getSelectedAlgorithms();
            if (selected.length === 0) {
                alert('Please select at least one algorithm to run.');
                return;
            }

            runBtn.disabled = true;
            document.getElementById('runBtnText').textContent = 'RUNNING...';

            await window.runAlgorithms(selected);
        });
    }
});

// ── DIFFICULTY / START GAME ──
function startGame(difficulty) {
    window.currentDifficulty = difficulty;

    let size = 20;
    if (difficulty === 'Easy')   size = 10;
    if (difficulty === 'Hard')   size = 30;

    const canvas = document.getElementById('gameCanvas');

    // Stop any previous animation
    if (window.gameGrid) window.gameGrid.stopWaterAnimation();

    const newMap = generateRandomMap(size);
    window.gameGrid = new GameGrid(canvas, newMap, size);
    window.gameGrid.render();
    window.gameGrid.startWaterAnimation();

    // Update top bar
    document.getElementById('topPlayerName').textContent  = window.playerName;
    document.getElementById('topDifficulty').textContent  = difficulty;
    document.getElementById('liveSteps').textContent = '0';
    document.getElementById('liveTime').textContent  = '0s';
    document.getElementById('miniPath').textContent  = '—';
    document.getElementById('miniSteps').textContent = '—';

    // Reset canvasHint
    const hint = document.getElementById('canvasHint');
    if (hint) hint.style.display = '';

    // Reset run button
    const btn = document.getElementById('runBtn');
    if (btn) {
        btn.disabled = true;
        document.getElementById('runBtnText').textContent = 'FINISH YOUR PATH FIRST';
    }

    showScreen('screen-game');

    // Give DOM a tick to paint before starting player
    setTimeout(() => { startPlayerTurn(); }, 100);
}

// ── CONFIRM BACK ──
function confirmBack() {
    if (window.playerStats && window.playerStats.active) {
        if (!confirm('Abandon your current game and go back to menu?')) return;
        if (window.gameGrid) window.gameGrid.stopWaterAnimation();
        window.playerStats.active = false;
    }
    showScreen('screen-difficulty');
}

// ── SELECTED ALGORITHMS ──
function getSelectedAlgorithms() {
    const checks = [
        { id: 'bfsCheck',      name: 'BFS' },
        { id: 'dfsCheck',      name: 'DFS' },
        { id: 'dijkstraCheck', name: 'Dijkstra' },
        { id: 'astarCheck',    name: 'AStar' }
    ];
    return checks.filter(c => {
        const el = document.getElementById(c.id);
        return el && el.checked;
    }).map(c => c.name);
}

// ── SHOW RESULTS ──
window.showResults = function(results) {
    window.lastResults = results;
    const ps = window.playerStats;

    // Compute player efficiency
    let optimalPath = ps.pathLength;
    if (results['AStar']    && results['AStar'].pathLength    > 0) optimalPath = results['AStar'].pathLength;
    else if (results['BFS'] && results['BFS'].pathLength > 0)      optimalPath = results['BFS'].pathLength;

    const playerEff = window.computeEfficiency(ps.pathLength, ps.stepsExplored, ps.timeTaken);

    // Build contestant list for comparison
    const contestants = [];

    if (ps.finished) {
        contestants.push({
            name:          window.playerName,
            type:          'player',
            pathLength:    ps.pathLength,
            stepsExplored: ps.stepsExplored,
            timeTaken:     ps.timeTaken,
            efficiency:    playerEff,
            found:         true
        });
    }

    const algoMeta = {
        BFS:      'BFS',
        DFS:      'DFS',
        Dijkstra: 'Dijkstra',
        AStar:    'A*'
    };

    for (const [key, label] of Object.entries(algoMeta)) {
        if (!results[key]) continue;
        const r = results[key];
        const eff = window.computeEfficiency(r.pathLength, r.stepsExplored, r.timeTaken);
        contestants.push({
            name:          label,
            type:          key.toLowerCase(),
            pathLength:    r.pathLength,
            stepsExplored: r.stepsExplored,
            timeTaken:     r.timeTaken,
            efficiency:    eff,
            found:         r.pathFound
        });
    }

    // Determine winner (highest efficiency among those who found a path)
    const found = contestants.filter(c => c.found && c.pathLength > 0);
    let winner = null;
    if (found.length > 0) {
        winner = found.reduce((best, c) => c.efficiency > best.efficiency ? c : best, found[0]);
    }

    // Populate results table
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    const rowColors = {
        player:   'row-player',
        bfs:      'row-bfs',
        dfs:      'row-dfs',
        dijkstra: 'row-dijkstra',
        astar:    'row-astar'
    };

    contestants.forEach(c => {
        const isWinner = winner && c.name === winner.name;
        const tr = document.createElement('tr');
        tr.className = rowColors[c.type] || '';
        if (isWinner) tr.classList.add('row-winner');

        const statusBadge = !c.found
            ? `<span class="badge-nope">No Path</span>`
            : isWinner
                ? `<span class="badge-winner">🏆 WINNER</span>`
                : `<span class="badge-found">✓ Found</span>`;

        tr.innerHTML = `
            <td style="font-weight:800">${isWinner ? '🏆 ' : ''}${c.name}</td>
            <td>${c.found ? c.pathLength : '—'}</td>
            <td>${c.found ? c.stepsExplored : '—'}</td>
            <td>${c.found ? c.timeTaken + 'ms' : '—'}</td>
            <td>${c.found ? c.efficiency : '—'}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });

    // Winner banner
    const banner = document.getElementById('winnerBanner');
    if (winner) {
        document.getElementById('winnerTrophy').textContent  = winner.type === 'player' ? '🏆' : '🤖';
        document.getElementById('winnerLabel').textContent   = 'WINNER!';
        document.getElementById('winnerName').textContent    = winner.name;
        document.getElementById('winnerDetail').textContent  = `Efficiency: ${winner.efficiency} · Path: ${winner.pathLength} steps · Time: ${winner.timeTaken}ms`;
        banner.className = 'winner-banner glass-card ' + (winner.type === 'player' ? 'player-wins' : 'algo-wins');
    } else {
        document.getElementById('winnerTrophy').textContent = '😢';
        document.getElementById('winnerLabel').textContent  = 'NO WINNER';
        document.getElementById('winnerName').textContent   = 'No path found!';
        document.getElementById('winnerDetail').textContent = 'Nobody reached the end.';
    }

    // Auto-save score to leaderboard
    saveScore(playerEff);

    showScreen('screen-results');
};

// ── SAVE SCORE ──
async function saveScore(efficiency) {
    const ps = window.playerStats;
    if (!ps.finished) return;
    try {
        await fetch('http://localhost:8080/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerName:    window.playerName,
                difficulty:    window.currentDifficulty,
                pathLength:    ps.pathLength,
                stepsExplored: ps.stepsExplored,
                timeTaken:     ps.timeTaken,
                efficiency:    efficiency
            })
        });
    } catch (e) {
        console.warn('Could not save score to backend:', e.message);
    }
}

// ── LEADERBOARD ──
window.loadLeaderboard = async function(difficulty) {
    difficulty = difficulty || window.currentDifficulty || 'Easy';

    // Update filter buttons
    ['Easy', 'Medium', 'Hard'].forEach(d => {
        const btn = document.getElementById('filter' + d);
        if (btn) btn.classList.toggle('active', d === difficulty);
    });

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '<tr><td colspan="5" style="color:#64748b;padding:2rem">Loading...</td></tr>';

    try {
        const res  = await fetch(`http://localhost:8080/api/leaderboard/${difficulty}`);
        const data = await res.json();

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="color:#64748b;padding:2rem">No scores yet for ' + difficulty + '. Be the first!</td></tr>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        const rankClasses = ['rank-gold', 'rank-silver', 'rank-bronze'];

        data.forEach((entry, i) => {
            const tr = document.createElement('tr');
            const isMe = entry.playerName === window.playerName;
            if (isMe) tr.classList.add('lb-me');

            const rankDisplay = i < 3
                ? `<span class="${rankClasses[i]}">${medals[i]}</span>`
                : `<span style="color:#64748b">#${i + 1}</span>`;

            tr.innerHTML = `
                <td>${rankDisplay}</td>
                <td style="font-weight:700${isMe ? ';color:#818cf8' : ''}">${entry.playerName}${isMe ? ' (You)' : ''}</td>
                <td style="font-weight:800">${entry.efficiency}</td>
                <td>${entry.pathLength}</td>
                <td>${entry.timeTaken}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:#ef4444;padding:2rem">⚠ Backend offline. Is Spring Boot running on port 8080?</td></tr>';
    }
};