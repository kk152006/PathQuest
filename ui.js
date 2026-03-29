// ui.js

function getSelectedAlgorithms() {
    const selected = [];
  
    if (document.getElementById("bfsCheck").checked) {
        selected.push("BFS");
    }
    if (document.getElementById("dfsCheck").checked) {
        selected.push("DFS");
    }
    if (document.getElementById("dijkstraCheck").checked) {
        selected.push("Dijkstra");
    }
    if (document.getElementById("astarCheck").checked) {
        selected.push("AStar");
    }
  
    return selected;
}

window.showResults = function(results) {
    if (results["BFS"]) {
        document.getElementById("bfs-path").innerText = results["BFS"].pathLength;
        document.getElementById("bfs-steps").innerText = results["BFS"].stepsExplored;
        document.getElementById("bfs-time").innerText = results["BFS"].timeTaken + "ms";
        let eff = Math.round((results["BFS"].pathLength / results["BFS"].stepsExplored) * 100) || 0;
        document.getElementById("bfs-efficiency").innerText = eff + "%";
    }
  
    if (results["DFS"]) {
        document.getElementById("dfs-path").innerText = results["DFS"].pathLength;
        document.getElementById("dfs-steps").innerText = results["DFS"].stepsExplored;
        document.getElementById("dfs-time").innerText = results["DFS"].timeTaken + "ms";
        let eff = Math.round((results["DFS"].pathLength / results["DFS"].stepsExplored) * 100) || 0;
        document.getElementById("dfs-efficiency").innerText = eff + "%";
    }
  
    if (results["Dijkstra"]) {
        document.getElementById("dijkstra-path").innerText = results["Dijkstra"].pathLength;
        document.getElementById("dijkstra-steps").innerText = results["Dijkstra"].stepsExplored;
        document.getElementById("dijkstra-time").innerText = results["Dijkstra"].timeTaken + "ms";
        let eff = Math.round((results["Dijkstra"].pathLength / results["Dijkstra"].stepsExplored) * 100) || 0;
        document.getElementById("dijkstra-efficiency").innerText = eff + "%";
    }
  
    if (results["AStar"]) {
        document.getElementById("astar-path").innerText = results["AStar"].pathLength;
        document.getElementById("astar-steps").innerText = results["AStar"].stepsExplored;
        document.getElementById("astar-time").innerText = results["AStar"].timeTaken + "ms";
        let eff = Math.round((results["AStar"].pathLength / results["AStar"].stepsExplored) * 100) || 0;
        document.getElementById("astar-efficiency").innerText = eff + "%";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const runBtn = document.getElementById("runBtn");
    
    if (runBtn) {
        runBtn.addEventListener("click", async () => {
            const selected = getSelectedAlgorithms();
          
            if (selected.length === 0) {
                alert("Select at least one algorithm");
                return;
            }
          
            console.log("Selected algorithms:", selected);

            // Clear the board visually before kicking off runs
            if (window.gameGrid) {
                window.gameGrid.clearHighlights();
            }
          
            // Start sequence synchronously blocking the UI flow appropriately 
            await window.runAlgorithms(selected);
            
            // showResults now officially triggers INSIDE algorithms.js exactly as instructed

            // Flip securely to final visual Results pane immediately after animation concludes
            if (typeof window.showScreen === 'function') {
                window.showScreen('screen-results');
            }
        });
    }
});
