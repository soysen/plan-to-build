import React from 'react';

interface CellProps {
  isAlive: boolean;
  row: number;
  col: number;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
}

export const Cell: React.FC<CellProps> = React.memo(
  ({ isAlive, row, col, onMouseDown, onMouseEnter }) => {
    return (
      <div
        className={`cell ${isAlive ? 'alive' : ''}`}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
      />
    );
  },
  (prevProps, nextProps) => {
    // 只有當 isAlive 改變時，這個 Cell 才可以重新渲染！
    // 點擊事件 callback 由於使用了 useCallback，Reference 是固定的，
    // 因此比較 isAlive 就足夠了。
    return prevProps.isAlive === nextProps.isAlive;
  }
);

Cell.displayName = 'Cell';
