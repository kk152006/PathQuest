function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fallback logic in case GameGrid doesn't have the explicit export methods yet
function defaultExportGrid() {
    const map = window.gameGrid.map;
    const grid = [];
    for (let r = 0; r < map.length; r++) {
        const row = [];
        for (let c = 0; c < map[r].length; c++) {
            // According to backend: 0 = walkable, 1 = blocked
            // Frontend: WALL=1, WATER=2, both are blocked.
            if (map[r][c] === 1 || map[r][c] === 2) {
                row.push(1);
            } else {
                row.push(0);
            }
        }
        grid.push(row);
    }
    return grid;
}

function defaultGetPos(tileType) {
    const map = window.gameGrid.map;
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === tileType) return { row: r, col: c };
        }
    }
    return null;
}

async function callAlgorithm(algoName) {
    // 1. Get grid from GameGrid
    const grid = typeof window.gameGrid.exportGrid === 'function' ? 
                 window.gameGrid.exportGrid() : defaultExportGrid();

    // 2. Get positions
    const start = typeof window.gameGrid.getStartPosition === 'function' ? 
                  window.gameGrid.getStartPosition() : defaultGetPos(4); // TILE.START
                  
    const end = typeof window.gameGrid.getEndPosition === 'function' ? 
                window.gameGrid.getEndPosition() : defaultGetPos(5); // TILE.END

    // 3. Send POST request
    const res = await fetch('http://localhost:8080/api/run-algorithm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grid,
            start,
            end,
            algorithm: algoName
        })
    });

    if (!res.ok) {
        console.error(`Error calling ${algoName}: ${res.status}`);
        return null;
    }

    return await res.json();
}

/**
 * Replace previous runAlgorithms to run the backend algorithms sequentially
 * @param {Array<string>} activeAlgorithms e.g. ['BFS', 'DFS', 'Dijkstra']
 */
window.runAlgorithms = async function(activeAlgorithms) {
    if (!window.gameGrid) return;
    
    window.algorithmResults = {};

    for (const algo of activeAlgorithms) {
        // Clear grid between runs
        window.gameGrid.clearHighlights();
        
        console.log(`Running ${algo}...`);
        const result = await callAlgorithm(algo);
        
        if (!result) continue;
        
        // Store result
        window.algorithmResults[algo] = result;

        // Animate visitedNodes
        if (result.visitedNodes) {
            for (const cell of result.visitedNodes) {
                // Do NOT override START/END tiles (4 and 5)
                const type = window.gameGrid.map[cell[0]][cell[1]];
                if (type !== 4 && type !== 5) {
                    window.gameGrid.highlightCell(cell[0], cell[1], '#4fc3f7', 0.35);
                    await sleep(30);
                }
            }
        }

        // Animate path
        if (result.pathFound && result.path) {
            for (const cell of result.path) {
                const type = window.gameGrid.map[cell[0]][cell[1]];
                if (type !== 4 && type !== 5) {
                    window.gameGrid.highlightCell(cell[0], cell[1], '#ffffff', 0.7);
                    await sleep(20);
                }
            }
        }
        
        // Small visual buffer before the next algorithm runs
        await sleep(500);
    }
    
    if (typeof window.showResults === 'function') {
        window.showResults(window.algorithmResults);
    }
};
