import { useState, useEffect, useRef, useCallback } from 'react';
import { createGrid, toggleCell, computeNextTick } from './core/gameEngine';
import { Cell } from './components/Cell';

const ROWS = 30;
const COLS = 30;

export default function App() {
  const [grid, setGrid] = useState<boolean[][]>(() => createGrid(ROWS, COLS));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(200); // 演化間隔 (ms)
  const [generation, setGeneration] = useState(0);

  const runningRef = useRef(running);
  runningRef.current = running;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const isMouseDown = useRef(false);
  const drawMode = useRef<boolean | null>(null); // true: 畫活細胞, false: 畫死細胞

  // 全域滑鼠放開監聽，防止移出網格後狀態卡死
  useEffect(() => {
    const handleMouseUp = () => {
      isMouseDown.current = false;
      drawMode.current = null;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // 核心演化的遞迴計時器
  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;

    const currentGrid = gridRef.current;
    const nextGrid = computeNextTick(currentGrid);

    // 檢查是否所有細胞都已死亡，或無狀態變更
    let hasChange = false;
    let hasLife = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (nextGrid[r][c] !== currentGrid[r][c]) {
          hasChange = true;
        }
        if (nextGrid[r][c]) {
          hasLife = true;
        }
      }
    }

    if (!hasChange || !hasLife) {
      setRunning(false);
      setGrid(nextGrid);
      return;
    }

    setGrid(nextGrid);
    setGeneration((gen) => gen + 1);

    setTimeout(runSimulation, speedRef.current);
  }, []);

  // 監聽開始與暫停
  useEffect(() => {
    if (running) {
      runningRef.current = true;
      runSimulation();
    } else {
      runningRef.current = false;
    }
  }, [running, runSimulation]);

  // 單擊細胞切換 (使用 useCallback 確保 Reference 穩定)
  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      if (runningRef.current) return; // 執行期間禁止手動畫圖
      isMouseDown.current = true;
      const targetState = !gridRef.current[row][col];
      drawMode.current = targetState;

      setGrid((prevGrid) => toggleCell(prevGrid, row, col));
    },
    []
  );

  // 拖曳滑過細胞 (使用 useCallback 確保 Reference 穩定)
  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (runningRef.current || !isMouseDown.current || drawMode.current === null) return;
      const targetState = drawMode.current;

      setGrid((prevGrid) =>
        prevGrid.map((r, ri) =>
          r.map((c, ci) => (ri === row && ci === col ? targetState : c))
        )
      );
    },
    []
  );

  // 隨機重置
  const handleRandom = () => {
    setRunning(false);
    setGeneration(0);
    setGrid(createGrid(ROWS, COLS, true, 0.3));
  };

  // 清空棋盤
  const handleClear = () => {
    setRunning(false);
    setGeneration(0);
    setGrid(createGrid(ROWS, COLS));
  };

  // 單步進程
  const handleNextStep = () => {
    if (running) return;
    setGrid((currentGrid) => {
      const nextGrid = computeNextTick(currentGrid);
      setGeneration((gen) => gen + 1);
      return nextGrid;
    });
  };

  return (
    <div className="container">
      <h1>CONWAY'S GAME OF LIFE</h1>

      {/* 控制面板 */}
      <div className="panel">
        <div className="controls-group">
          <button
            className={`btn ${running ? '' : 'btn-primary'}`}
            onClick={() => setRunning(!running)}
          >
            {running ? (
              <>
                <span>⏸</span> Pause
              </>
            ) : (
              <>
                <span>▶</span> Start
              </>
            )}
          </button>

          <button className="btn" onClick={handleNextStep} disabled={running}>
            <span>⏭</span> Step
          </button>

          <button className="btn" onClick={handleClear}>
            <span>🧹</span> Clear
          </button>

          <button className="btn" onClick={handleRandom}>
            <span>🎲</span> Random
          </button>
        </div>

        <div className="slider-group">
          <span>Speed:</span>
          <input
            type="range"
            min="50"
            max="800"
            step="50"
            value={1000 - speed} // 數值越大演化越快
            onChange={(e) => setSpeed(1000 - parseInt(e.target.value))}
            className="slider"
          />
          <span>{(1000 / speed).toFixed(1)} ticks/s</span>
        </div>

        <div className="counter">
          <span>Generation: {generation}</span>
        </div>
      </div>

      {/* 網格 */}
      <div className="grid-container">
        <div className="grid">
          {grid.map((row, r) =>
            row.map((isAlive, c) => (
              <Cell
                key={`${r}-${c}`}
                isAlive={isAlive}
                row={r}
                col={c}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
