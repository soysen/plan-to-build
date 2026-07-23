/**
 * 建立一個新網格，可以為空或隨機分佈
 */
export function createGrid(rows: number, cols: number, randomize = false, density = 0.3): boolean[][] {
  const grid: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      if (randomize) {
        row.push(Math.random() < density);
      } else {
        row.push(false);
      }
    }
    grid.push(row);
  }
  return grid;
}

/**
 * 切換特定細胞的生死狀態 (Immutable Update)
 */
export function toggleCell(grid: boolean[][], r: number, c: number): boolean[][] {
  return grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (rowIndex === r && colIndex === c) {
        return !cell;
      }
      return cell;
    })
  );
}

/**
 * 計算指定細胞在 toroidal 環面空間下的存活鄰居數
 */
export function countNeighbors(grid: boolean[][], r: number, c: number): number {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  if (rows === 0 || cols === 0) return 0;

  let neighbors = 0;

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      // 使用同餘定理 (Modulo) 實作繞回
      const neighborRow = (r + i + rows) % rows;
      const neighborCol = (c + j + cols) % cols;

      if (grid[neighborRow][neighborCol]) {
        neighbors++;
      }
    }
  }

  return neighbors;
}

/**
 * 根據康威生命演化規則計算下一世代的網格 (Immutable Update)
 */
export function computeNextTick(grid: boolean[][]): boolean[][] {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  if (rows === 0 || cols === 0) return [];

  // 建立全新網格，以進行 Immutable 更新
  const nextGrid = createGrid(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors = countNeighbors(grid, r, c);
      const isAlive = grid[r][c];

      if (isAlive) {
        // 活細胞：鄰居為 2 或 3 時存活，否則死於孤單或過擠
        nextGrid[r][c] = neighbors === 2 || neighbors === 3;
      } else {
        // 死細胞：鄰居剛好為 3 時復活
        nextGrid[r][c] = neighbors === 3;
      }
    }
  }

  return nextGrid;
}
