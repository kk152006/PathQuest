const TILE = { GRASS: 0, WALL: 1, WATER: 2, SAND: 3, START: 4, END: 5 };

// ── Guaranteed-solvable map generator ──
function generateRandomMap(size) {
    let map, attempts = 0;
    do {
        map = buildMap(size);
        attempts++;
    } while (!isSolvable(map, size) && attempts < 30);

    // Force solvable if still failing
    if (!isSolvable(map, size)) {
        carvePathBFS(map, 1, 1, size - 2, size - 2, size);
    }
    return map;
}

function buildMap(size) {
    const map = Array.from({ length: size }, () => Array(size).fill(TILE.GRASS));
    const density = size <= 10 ? 0.25 : size <= 20 ? 0.45 : 0.6;
    const maxCluster = size <= 10 ? 2 : 4;

    // Wall clusters
    const numWalls = Math.floor(size * density);
    for (let i = 0; i < numWalls; i++) {
        const r = 2 + Math.floor(Math.random() * (size - 4));
        const c = 2 + Math.floor(Math.random() * (size - 4));
        const h = 1 + Math.floor(Math.random() * maxCluster);
        const w = 1 + Math.floor(Math.random() * maxCluster);
        for (let dr = 0; dr < h && r + dr < size; dr++)
            for (let dc = 0; dc < w && c + dc < size; dc++)
                map[r + dr][c + dc] = TILE.WALL;
    }

    // Water patches
    for (let i = 0; i < Math.floor(size * 0.1); i++) {
        const r = 2 + Math.floor(Math.random() * (size - 4));
        const c = 2 + Math.floor(Math.random() * (size - 4));
        const s = 2 + Math.floor(Math.random() * 3);
        for (let dr = 0; dr < s && r + dr < size; dr++)
            for (let dc = 0; dc < s && c + dc < size; dc++)
                if (map[r + dr][c + dc] !== TILE.WALL)
                    map[r + dr][c + dc] = TILE.WATER;
    }

    // Sand patches
    for (let i = 0; i < Math.floor(size * 0.15); i++) {
        const r = 1 + Math.floor(Math.random() * (size - 2));
        const c = 1 + Math.floor(Math.random() * (size - 2));
        const s = 2 + Math.floor(Math.random() * 4);
        for (let dr = 0; dr < s && r + dr < size; dr++)
            for (let dc = 0; dc < s && c + dc < size; dc++)
                if (map[r + dr][c + dc] === TILE.GRASS)
                    map[r + dr][c + dc] = TILE.SAND;
    }

    // Clear start/end zones
    for (let r = 0; r <= 2; r++) for (let c = 0; c <= 2; c++) if (r < size && c < size) map[r][c] = TILE.GRASS;
    for (let r = size - 3; r < size; r++) for (let c = size - 3; c < size; c++) if (r >= 0 && c >= 0) map[r][c] = TILE.GRASS;

    map[1][1] = TILE.START;
    map[size - 2][size - 2] = TILE.END;
    return map;
}

function isSolvable(map, size) {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const queue = [[1, 1]];
    visited[1][1] = true;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    while (queue.length > 0) {
        const [r, c] = queue.shift();
        if (r === size - 2 && c === size - 2) return true;
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
                const t = map[nr][nc];
                if (t !== TILE.WALL && t !== TILE.WATER) { visited[nr][nc] = true; queue.push([nr, nc]); }
            }
        }
    }
    return false;
}

function carvePathBFS(map, sr, sc, er, ec, size) {
    const prev = Array.from({ length: size }, () => Array(size).fill(null));
    const queue = [[sr, sc]];
    prev[sr][sc] = [-1, -1];
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    while (queue.length > 0) {
        const [r, c] = queue.shift();
        if (r === er && c === ec) {
            let [cr, cc] = [er, ec];
            while (!(cr === sr && cc === sc)) {
                if (map[cr][cc] !== TILE.START && map[cr][cc] !== TILE.END) map[cr][cc] = TILE.GRASS;
                [cr, cc] = prev[cr][cc];
            }
            return;
        }
        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && prev[nr][nc] === null) {
                prev[nr][nc] = [r, c]; queue.push([nr, nc]);
            }
        }
    }
}

// ── GameGrid Class ──
class GameGrid {
    constructor(canvas, map, size) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = map;
        this.size = size;
        this.tileSize = 600 / size;
        this.waterFrame = 0;
        this._animId = null;
        this.playerPath = [];   // ordered list of [r,c] player visited
        this.playerCurrent = null;
    }

    drawTile(r, c, type) {
        const x = c * this.tileSize, y = r * this.tileSize;
        const ts = this.tileSize;
        const ctx = this.ctx;
        ctx.clearRect(x, y, ts, ts);

        switch (type) {
            case TILE.GRASS:
                ctx.fillStyle = '#0f172a'; ctx.fillRect(x, y, ts, ts);
                ctx.fillStyle = 'rgba(255,255,255,0.03)';
                ctx.fillRect(x + ts * 0.2, y + ts * 0.2, ts * 0.06, ts * 0.06);
                ctx.fillRect(x + ts * 0.7, y + ts * 0.4, ts * 0.06, ts * 0.06);
                break;
            case TILE.WALL:
                ctx.fillStyle = '#1e293b'; ctx.fillRect(x, y, ts, ts);
                ctx.fillStyle = '#334155';
                ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
                ctx.fillStyle = '#475569';
                ctx.fillRect(x + 2, y + 2, ts * 0.3, ts * 0.3);
                ctx.fillRect(x + ts * 0.6, y + ts * 0.5, ts * 0.3, ts * 0.3);
                break;
            case TILE.WATER: {
                ctx.fillStyle = '#0c1a3a'; ctx.fillRect(x, y, ts, ts);
                ctx.fillStyle = '#1e3a8a'; ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
                const t = this.waterFrame / 30;
                ctx.strokeStyle = 'rgba(96,165,250,0.6)'; ctx.lineWidth = ts * 0.08;
                ctx.beginPath();
                const mid1 = y + ts * 0.4 + Math.sin(t + c) * ts * 0.08;
                ctx.moveTo(x + ts * 0.1, mid1);
                ctx.quadraticCurveTo(x + ts * 0.5, mid1 - ts * 0.1, x + ts * 0.9, mid1);
                ctx.stroke();
                ctx.beginPath();
                const mid2 = y + ts * 0.65 + Math.cos(t + r) * ts * 0.08;
                ctx.moveTo(x + ts * 0.1, mid2);
                ctx.quadraticCurveTo(x + ts * 0.5, mid2 + ts * 0.1, x + ts * 0.9, mid2);
                ctx.stroke();
                break;
            }
            case TILE.SAND:
                ctx.fillStyle = '#292014'; ctx.fillRect(x, y, ts, ts);
                ctx.fillStyle = '#78350f'; ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
                ctx.fillStyle = 'rgba(251,191,36,0.35)';
                ctx.fillRect(x + ts * 0.25, y + ts * 0.25, ts * 0.08, ts * 0.08);
                ctx.fillRect(x + ts * 0.6, y + ts * 0.5, ts * 0.08, ts * 0.08);
                ctx.fillRect(x + ts * 0.4, y + ts * 0.7, ts * 0.08, ts * 0.08);
                break;
            case TILE.START: {
                ctx.fillStyle = '#052e16'; ctx.fillRect(x, y, ts, ts);
                ctx.fillStyle = '#10b981'; ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
                ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(8, ts * 0.45)}px Inter,sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('S', x + ts / 2, y + ts / 2);
                break;
            }
            case TILE.END: {
                ctx.fillStyle = '#450a0a'; ctx.fillRect(x, y, ts, ts);
                ctx.fillStyle = '#ef4444'; ctx.fillRect(x + 1, y + 1, ts - 2, ts - 2);
                ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.max(8, ts * 0.45)}px Inter,sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('E', x + ts / 2, y + ts / 2);
                break;
            }
        }
    }

    drawGrid() {
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++)
                this.drawTile(r, c, this.map[r][c]);
        // grid lines
        this.ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        for (let i = 0; i <= this.size; i++) {
            this.ctx.moveTo(0, i * this.tileSize); this.ctx.lineTo(600, i * this.tileSize);
            this.ctx.moveTo(i * this.tileSize, 0); this.ctx.lineTo(i * this.tileSize, 600);
        }
        this.ctx.stroke();
    }

    render() { this.drawGrid(); }

    clearHighlights() { this.drawGrid(); }

    highlightCell(r, c, color, alpha) {
        const x = c * this.tileSize, y = r * this.tileSize;
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
        this.ctx.globalAlpha = 1;
    }

    drawPlayerOnTop() {
        if (!this.playerCurrent) return;
        const ts = this.tileSize;
        // Draw trail
        for (const [r, c] of this.playerPath) {
            const t = this.map[r][c];
            if (t !== TILE.START && t !== TILE.END) {
                this.highlightCell(r, c, '#10b981', 0.35);
            }
        }
        // Draw current position marker
        const [pr, pc] = this.playerCurrent;
        const x = pc * ts, y = pr * ts;
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#34d399';
        this.ctx.beginPath();
        this.ctx.arc(x + ts / 2, y + ts / 2, Math.max(3, ts * 0.35), 0, Math.PI * 2);
        this.ctx.fill();
        // Glow ring
        this.ctx.strokeStyle = 'rgba(52,211,153,0.5)';
        this.ctx.lineWidth = Math.max(1, ts * 0.12);
        this.ctx.beginPath();
        this.ctx.arc(x + ts / 2, y + ts / 2, Math.max(4, ts * 0.45), 0, Math.PI * 2);
        this.ctx.stroke();
    }

    startWaterAnimation() {
        const animate = () => {
            this.waterFrame++;
            for (let r = 0; r < this.size; r++)
                for (let c = 0; c < this.size; c++)
                    if (this.map[r][c] === TILE.WATER) this.drawTile(r, c, TILE.WATER);
            // Redraw player on top of animation frame
            this.drawPlayerOnTop();
            this._animId = requestAnimationFrame(animate);
        };
        this._animId = requestAnimationFrame(animate);
    }

    stopWaterAnimation() {
        if (this._animId) { cancelAnimationFrame(this._animId); this._animId = null; }
    }

    isWalkable(r, c) {
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) return false;
        const t = this.map[r][c];
        return t === TILE.GRASS || t === TILE.SAND || t === TILE.START || t === TILE.END;
    }

    getStartPos() {
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++)
                if (this.map[r][c] === TILE.START) return { row: r, col: c };
        return { row: 1, col: 1 };
    }

    getEndPos() {
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++)
                if (this.map[r][c] === TILE.END) return { row: r, col: c };
        return { row: this.size - 2, col: this.size - 2 };
    }

    exportGrid() {
        return this.map.map(row => row.map(t => (t === TILE.WALL || t === TILE.WATER) ? 1 : 0));
    }
}