package com.pathquest.model;
public class PathRequest {
    private int[][] grid;
    private Cell start;
    private Cell end;
    private String algorithm;
    public static class Cell {
        private int row;
        private int col;
        public int getRow() { return row; }
        public int getCol() { return col; }
        public void setRow(int row) { this.row = row; }
        public void setCol(int col) { this.col = col; }
    }
    public int[][] getGrid() { return grid; }
    public void setGrid(int[][] grid) { this.grid = grid; }
    public Cell getStart() { return start; }
    public void setStart(Cell start) { this.start = start; }
    public Cell getEnd() { return end; }
    public void setEnd(Cell end) { this.end = end; }
    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
}