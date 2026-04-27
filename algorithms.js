function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showOverlay(text) {
    document.getElementById('overlayText').textContent = text;
    document.getElementById('algoOverlay').classList.add('active');
}
function hideOverlay() {
    document.getElementById('algoOverlay').classList.remove('active');
}

async function callAlgorithm(algoName) {
    const grid  = window.gameGrid.exportGrid();
    const start = window.gameGrid.getStartPos();
    const end   = window.gameGrid.getEndPos();
    try {
        const res = await fetch('http://localhost:8080/api/run-algorithm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grid, start, end, algorithm: algoName })
        });
        if (!res.ok) { console.error(`${algoName} error: ${res.status}`); return null; }
        return await res.json();
    } catch (e) {
        console.error(`Backend unreachable for ${algoName}:`, e);
        return null;
    }
}

// Colour per algorithm
const ALGO_COLORS = {
    BFS:      { visited: 'rgba(96,165,250,0.25)',  path: 'rgba(96,165,250,0.75)' },
    DFS:      { visited: 'rgba(251,113,133,0.25)', path: 'rgba(251,113,133,0.75)' },
    Dijkstra: { visited: 'rgba(251,191,36,0.25)',  path: 'rgba(251,191,36,0.75)' },
    AStar:    { visited: 'rgba(192,132,252,0.25)', path: 'rgba(192,132,252,0.75)' }
};

window.runAlgorithms = async function(activeAlgorithms) {
    if (!window.gameGrid) return;
    window.algorithmResults = {};

    // Stop water animation during algo run to reduce jitter
    window.gameGrid.stopWaterAnimation();

    for (const algo of activeAlgorithms) {
        showOverlay(`Running ${algo}...`);
        await sleep(300);

        const result = await callAlgorithm(algo);
        if (!result) continue;
        window.algorithmResults[algo] = result;

        const col = ALGO_COLORS[algo] || { visited: 'rgba(255,255,255,0.2)', path: 'rgba(255,255,255,0.6)' };

        // Animate visited nodes
        window.gameGrid.clearHighlights();
        if (result.visitedNodes && result.visitedNodes.length > 0) {
            const step = Math.max(1, Math.floor(result.visitedNodes.length / 80));
            for (let i = 0; i < result.visitedNodes.length; i++) {
                const [r, c] = result.visitedNodes[i];
                const t = window.gameGrid.map[r][c];
                if (t !== TILE.START && t !== TILE.END) {
                    window.gameGrid.highlightCell(r, c, col.visited, 0.9);
                }
                if (i % step === 0) await sleep(18);
            }
        }

        // Animate final path
        if (result.pathFound && result.path && result.path.length > 0) {
            for (const [r, c] of result.path) {
                const t = window.gameGrid.map[r][c];
                if (t !== TILE.START && t !== TILE.END) {
                    window.gameGrid.highlightCell(r, c, col.path, 0.95);
                }
                await sleep(25);
            }
        }

        await sleep(600);
    }

    hideOverlay();
    window.gameGrid.startWaterAnimation();

    // Show results
    if (typeof window.showResults === 'function') {
        window.showResults(window.algorithmResults);
    }
};

// Compute efficiency score (same formula for player and algos)
function computeEfficiency(pathLength, stepsExplored, timeTaken) {
    if (pathLength <= 0) return 0;
    const pathScore  = 1000 / Math.max(1, pathLength);
    const stepScore  = 1000 / Math.max(1, stepsExplored);
    const timeScore  = 1000 / Math.max(1, timeTaken);
    return Math.round((pathScore + stepScore * 0.5 + timeScore * 0.3) * 10);
}

window.computeEfficiency = computeEfficiency;