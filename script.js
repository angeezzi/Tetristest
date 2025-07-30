class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.pieces = [
            // I piece
            {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: '#3498db'
            },
            // O piece
            {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#f39c12'
            },
            // T piece
            {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#9b59b6'
            },
            // S piece
            {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: '#27ae60'
            },
            // Z piece
            {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#e74c3c'
            },
            // J piece
            {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#2980b9'
            },
            // L piece
            {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#e67e22'
            }
        ];
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.clearBoard();
        this.generateNewPiece();
        this.updateDisplay();
    }
    
    clearBoard() {
        this.board = [];
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][x] = 0;
            }
        }
    }
    
    generateNewPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.createPiece();
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // Check if game over
        if (this.isCollision(this.currentPiece)) {
            this.gameOver();
        }
    }
    
    createPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        const piece = this.pieces[pieceIndex];
        
        return {
            shape: piece.shape,
            color: piece.color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0
        };
    }
    
    isCollision(piece, offsetX = 0, offsetY = 0) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    rotatePiece() {
        const rotated = [];
        const shape = this.currentPiece.shape;
        
        for (let x = 0; x < shape[0].length; x++) {
            rotated[x] = [];
            for (let y = shape.length - 1; y >= 0; y--) {
                rotated[x][shape.length - 1 - y] = shape[y][x];
            }
        }
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.isCollision(this.currentPiece)) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    movePiece(dx, dy) {
        if (!this.isCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }
    
    dropPiece() {
        if (this.movePiece(0, 1)) {
            this.score += 1;
        } else {
            this.placePiece();
            this.clearLines();
            this.generateNewPiece();
        }
    }
    
    hardDrop() {
        while (this.movePiece(0, 1)) {
            this.score += 2;
        }
        this.placePiece();
        this.clearLines();
        this.generateNewPiece();
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }
    
    drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        
        // Add highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * this.BLOCK_SIZE + 2, y * this.BLOCK_SIZE + 2, this.BLOCK_SIZE - 4, 4);
        ctx.fillRect(x * this.BLOCK_SIZE + 2, y * this.BLOCK_SIZE + 2, 4, this.BLOCK_SIZE - 4);
    }
    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(this.ctx, x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const drawX = this.currentPiece.x + x;
                        const drawY = this.currentPiece.y + y;
                        if (drawY >= 0) {
                            this.drawBlock(this.ctx, drawX, drawY, this.currentPiece.color);
                        }
                    }
                }
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.nextCtx.fillStyle = this.nextPiece.color;
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                        
                        this.nextCtx.strokeStyle = '#333';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                    }
                }
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
        
        this.drawBoard();
        this.drawNextPiece();
    }
    
    gameLoop(timestamp) {
        if (!this.gameRunning || this.gamePaused) {
            return;
        }
        
        if (timestamp - this.dropTime > this.dropInterval) {
            this.dropPiece();
            this.dropTime = timestamp;
        }
        
        this.updateDisplay();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.dropTime = performance.now();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    pauseGame() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Resume' : 'Pause';
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.init();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';
        document.getElementById('gameOver').style.display = 'none';
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'flex';
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.dropPiece();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    this.pauseGame();
                    break;
            }
        });
        
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Tetris();
}); 