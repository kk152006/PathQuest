const TILE = {
  GRASS: 0,
  WALL: 1,
  WATER: 2,
  SAND: 3,
  START: 4,
  END: 5
};

// Create a 20x20 array called defaultMap, fill all cells with GRASS
const defaultMap = Array.from({ length: 20 }, () => Array(20).fill(TILE.GRASS));

// Add WALL clusters
for (let r = 3; r <= 7; r++) { defaultMap[r][5] = TILE.WALL; defaultMap[r][6] = TILE.WALL; }
for (let r = 8; r <= 14; r++) { defaultMap[r][10] = TILE.WALL; defaultMap[r][11] = TILE.WALL; }
for (let r = 3; r <= 8; r++) { defaultMap[r][15] = TILE.WALL; defaultMap[r][16] = TILE.WALL; }

// Add WATER
for (let r = 12; r <= 14; r++) {
    for (let c = 3; c <= 6; c++) {
        defaultMap[r][c] = TILE.WATER;
    }
}

// Add SAND
for (let r = 15; r <= 18; r++) {
    for (let c = 12; c <= 16; c++) {
        defaultMap[r][c] = TILE.SAND;
    }
}

// Set START and END
defaultMap[1][1] = TILE.START;
defaultMap[18][18] = TILE.END;


class GameGrid {
    constructor(canvas, map) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = map;
        this.tileSize = 30;
        
        // State for Wall Drawing Tool
        this.isDrawingWall = false;
        this.lastDrawnCell = null;

        // Start animating water tiles
        this.startWaterAnimation();
    }

    drawTile(row, col, tileType) {
        const x = col * this.tileSize;
        const y = row * this.tileSize;

        // Clear the cell precisely before drawing to avoid artifacts
        this.ctx.clearRect(x, y, this.tileSize, this.tileSize);

        switch (tileType) {
            case TILE.GRASS:
                this.ctx.fillStyle = '#2d5a1b';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Add exactly 3 small dots (#1e3d12, 2x2px) at fixed positions
                this.ctx.fillStyle = '#1e3d12';
                this.ctx.fillRect(x + 5, y + 5, 2, 2);
                this.ctx.fillRect(x + 22, y + 12, 2, 2);
                this.ctx.fillRect(x + 10, y + 24, 2, 2);
                break;
                
            case TILE.WALL:
                this.ctx.fillStyle = '#3d3d3d';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Draw inner border (#555, 2px inset)
                this.ctx.strokeStyle = '#555555';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
                
                // Add 2 diagonal crack lines (#2a2a2a)
                this.ctx.strokeStyle = '#2a2a2a';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(x + 6, y + 6);
                this.ctx.lineTo(x + 14, y + 14);
                this.ctx.moveTo(x + 24, y + 18);
                this.ctx.lineTo(x + 16, y + 26);
                this.ctx.stroke();
                break;

            case TILE.WATER:
                this.ctx.fillStyle = '#1a3a5c';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Add 2 horizontal wavy lines (#2a5a8c), animate via offset
                this.ctx.strokeStyle = '#2a5a8c';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                let t = performance.now() / 400;
                let offset1 = Math.sin(t + col + row) * 3;
                let offset2 = Math.cos(t + col + row) * 3;
                
                // Line 1
                this.ctx.moveTo(x, y + 10 + offset1);
                this.ctx.quadraticCurveTo(x + 15, y + 10 - offset1, x + 30, y + 10 + offset1);
                
                // Line 2
                this.ctx.moveTo(x, y + 20 + offset2);
                this.ctx.quadraticCurveTo(x + 15, y + 20 - offset2, x + 30, y + 20 + offset2);
                
                this.ctx.stroke();
                break;

            case TILE.SAND:
                this.ctx.fillStyle = '#8b7355';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Add 3 small specks (#a08060)
                this.ctx.fillStyle = '#a08060';
                this.ctx.fillRect(x + 8, y + 8, 2, 2);
                this.ctx.fillRect(x + 22, y + 12, 2, 2);
                this.ctx.fillRect(x + 14, y + 22, 2, 2);
                break;

            case TILE.START:
                this.ctx.fillStyle = '#1a4a1a';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Draw center circle (#00ff88) - keeping standard requirement despite theme change.
                this.ctx.fillStyle = '#00ff88';
                this.ctx.beginPath();
                this.ctx.arc(x + 15, y + 15, 8, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw white "S" centered
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px Inter, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('S', x + 15, y + 15);
                break;

            case TILE.END:
                this.ctx.fillStyle = '#4a1a1a';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Draw center circle (#ff4444)
                this.ctx.fillStyle = '#ff4444';
                this.ctx.beginPath();
                this.ctx.arc(x + 15, y + 15, 8, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw white "E" centered
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px Inter, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('E', x + 15, y + 15);
                break;
        }
    }

    drawGrid() {
        for (let r = 0; r < 20; r++) {
            for (let c = 0; c < 20; c++) {
                this.drawTile(r, c, this.map[r][c]);
            }
        }
    }

    drawGridLines() {
        this.ctx.strokeStyle = '#ffffff08';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        for (let i = 0; i <= 20; i++) {
            // Horizontal lines
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(600, i * this.tileSize);
            // Vertical lines
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, 600);
        }
        
        this.ctx.stroke();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawGridLines();
    }

    startWaterAnimation() {
        const animate = () => {
            let hasWater = false;
            
            // Only re-render cells tagged as water to avoid full re-renders
            for (let r = 0; r < 20; r++) {
                for (let c = 0; c < 20; c++) {
                    if (this.map[r][c] === TILE.WATER) {
                        this.drawTile(r, c, TILE.WATER);
                        
                        // Because the grid line overlaps, redraw it precisely for that box
                        this.ctx.strokeStyle = '#ffffff08';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
                        
                        hasWater = true;
                    }
                }
            }
            this.animationRequestId = requestAnimationFrame(animate);
        };
        
        // Start animation immediately 
        if (!this.animationRequestId) {
            animate();
        }
    }

    getCell(pixelX, pixelY) {
        return {
            row: Math.floor(pixelY / this.tileSize),
            col: Math.floor(pixelX / this.tileSize)
        };
    }

    setTile(row, col, tileType) {
        if (row >= 0 && row < 20 && col >= 0 && col < 20) {
            this.map[row][col] = tileType;
            this.drawTile(row, col, tileType);
            
            // Redraw subset of grid line for that specific tile
            this.ctx.strokeStyle = '#ffffff08';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
        }
    }

    isWalkable(row, col) {
        // Bounds check implicitly handled if querying outside grid, 
        // assuming callers check bounds, but just in case:
        if (row < 0 || row >= 20 || col < 0 || col >= 20) return false;
        
        const t = this.map[row][col];
        return t === TILE.GRASS || t === TILE.SAND || t === TILE.START || t === TILE.END;
    }

    highlightCell(row, col, color, alpha) {
        const x = col * this.tileSize;
        const y = row * this.tileSize;
        
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
        this.ctx.globalAlpha = 1.0; 
    }

    clearHighlights() {
        this.render();
    }

    // --- WALL DRAWING TOOL ---

    enableWallDrawing() {
        this.isDrawingWall = false;
        this.lastDrawnCell = null;

        this.mouseDownHandler = (e) => {
            this.isDrawingWall = true;
            this.processDrawEvent(e);
        };

        this.mouseMoveHandler = (e) => {
            if (this.isDrawingWall) {
                this.processDrawEvent(e);
            }
        };

        this.mouseUpHandler = () => {
            this.isDrawingWall = false;
            this.lastDrawnCell = null;
        };
        
        this.mouseLeaveHandler = () => {
            this.isDrawingWall = false;
            this.lastDrawnCell = null;
        };

        this.canvas.addEventListener('mousedown', this.mouseDownHandler);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
        this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
    }

    disableWallDrawing() {
        if (this.mouseDownHandler) {
            this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
            this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
            this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
            this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
        }
    }

    processDrawEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Scaling ensures accuracy if CSS resized the canvas
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const pixelX = (e.clientX - rect.left) * scaleX;
        const pixelY = (e.clientY - rect.top) * scaleY;

        const cell = this.getCell(pixelX, pixelY);

        // Bounds strictly inside array
        if (cell.row >= 0 && cell.row < 20 && cell.col >= 0 && cell.col < 20) {
            
            // Avoid drawing the exact same cell over and over during a single mouse stroke
            if (this.lastDrawnCell && this.lastDrawnCell.row === cell.row && this.lastDrawnCell.col === cell.col) {
                return;
            }

            const currentTile = this.map[cell.row][cell.col];
            
            // Never overwrite the START or END markers logically or visually
            if (currentTile !== TILE.START && currentTile !== TILE.END) {
                this.setTile(cell.row, cell.col, TILE.WALL);
                this.lastDrawnCell = cell;
            }
        }
    }
}

// Ensure the game grid renders up properly when the game screen becomes active
// Intercepting index.html showScreen() logic
const _originalShowScreen = window.showScreen;
window.showScreen = function(id) {
    if (typeof _originalShowScreen === "function") {
        _originalShowScreen(id);
    }
    
    // When game screen fades in, refresh its canvas fully
    if (id === 'screen-game' && window.gameGrid) {
        window.gameGrid.render();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        // Initialize the GameGrid object
        const grid = new GameGrid(canvas, defaultMap);
        
        // Initial render
        grid.render();
        
        // Expose globally for UI controls
        window.gameGrid = grid;
    }
});
