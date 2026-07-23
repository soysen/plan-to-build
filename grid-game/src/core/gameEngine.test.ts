import { describe, it, expect } from 'vitest';
import { createGrid, toggleCell, countNeighbors, computeNextTick } from './gameEngine';

describe('Game of Life - gameEngine', () => {
  describe('createGrid', () => {
    it('should create an empty grid of specified dimensions', () => {
      const rows = 5;
      const cols = 5;
      const grid = createGrid(rows, cols);
      expect(grid.length).toBe(rows);
      expect(grid[0].length).toBe(cols);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          expect(grid[r][c]).toBe(false);
        }
      }
    });

    it('should create a randomized grid with roughly target density', () => {
      const rows = 20;
      const cols = 20;
      const grid = createGrid(rows, cols, true, 0.3);
      let aliveCount = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c]) aliveCount++;
        }
      }
      // ~30% of 400 is 120. Standard deviation is small, should fall between 50 and 200.
      expect(aliveCount).toBeGreaterThan(50);
      expect(aliveCount).toBeLessThan(200);
    });
  });

  describe('toggleCell', () => {
    it('should toggle dead to alive and return a new array reference', () => {
      const grid = createGrid(3, 3);
      const newGrid = toggleCell(grid, 1, 1);
      expect(newGrid).not.toBe(grid); // Reference equality check (immutable)
      expect(grid[1][1]).toBe(false); // Original unchanged
      expect(newGrid[1][1]).toBe(true); // New is toggled
    });

    it('should toggle alive to dead', () => {
      const grid = createGrid(3, 3);
      grid[1][1] = true;
      const newGrid = toggleCell(grid, 1, 1);
      expect(newGrid[1][1]).toBe(false);
    });
  });

  describe('countNeighbors', () => {
    it('should count 8 neighbors in middle of grid', () => {
      const grid = createGrid(3, 3);
      // Set some neighbors around (1, 1)
      grid[0][0] = true;
      grid[0][1] = true;
      grid[2][2] = true;
      // Neighbors of (1, 1) should be 3
      expect(countNeighbors(grid, 1, 1)).toBe(3);
    });

    it('should implement toroidal wrap-around (border crossing)', () => {
      const grid = createGrid(3, 3);
      // Top-left cell (0, 0)
      // Its top-left neighbor is (2, 2) in toroidal space
      grid[2][2] = true;
      // Its right neighbor is (0, 1)
      grid[0][1] = true;
      // Its bottom-right neighbor is (1, 1)
      grid[1][1] = true;

      expect(countNeighbors(grid, 0, 0)).toBe(3);
    });
  });

  describe('computeNextTick', () => {
    it('should die from underpopulation (0 or 1 live neighbors)', () => {
      const grid = createGrid(3, 3);
      grid[1][1] = true; // Lone cell
      const next = computeNextTick(grid);
      expect(next[1][1]).toBe(false);

      const grid2 = createGrid(3, 3);
      grid2[1][1] = true;
      grid2[0][0] = true; // Only 1 neighbor
      const next2 = computeNextTick(grid2);
      expect(next2[1][1]).toBe(false);
    });

    it('should survive from stable population (2 or 3 live neighbors)', () => {
      const grid = createGrid(3, 3);
      grid[1][1] = true;
      grid[0][0] = true;
      grid[0][1] = true; // 2 neighbors
      const next = computeNextTick(grid);
      expect(next[1][1]).toBe(true);

      const grid2 = createGrid(3, 3);
      grid2[1][1] = true;
      grid2[0][0] = true;
      grid2[0][1] = true;
      grid2[0][2] = true; // 3 neighbors
      const next2 = computeNextTick(grid2);
      expect(next2[1][1]).toBe(true);
    });

    it('should die from overpopulation (>= 4 live neighbors)', () => {
      const grid = createGrid(3, 3);
      grid[1][1] = true;
      grid[0][0] = true;
      grid[0][1] = true;
      grid[0][2] = true;
      grid[1][0] = true; // 4 neighbors
      const next = computeNextTick(grid);
      expect(next[1][1]).toBe(false);
    });

    it('should reproduce and become alive (exactly 3 live neighbors)', () => {
      const grid = createGrid(3, 3);
      // (1, 1) is dead
      grid[0][0] = true;
      grid[0][1] = true;
      grid[0][2] = true; // 3 neighbors
      const next = computeNextTick(grid);
      expect(next[1][1]).toBe(true);
    });

    it('should not reproduce with only 2 live neighbors', () => {
      const grid = createGrid(3, 3);
      // (1, 1) is dead
      grid[0][0] = true;
      grid[0][1] = true; // 2 neighbors
      const next = computeNextTick(grid);
      expect(next[1][1]).toBe(false);
    });
  });
});
