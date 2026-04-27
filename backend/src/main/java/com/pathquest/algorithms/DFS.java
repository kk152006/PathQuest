package com.pathquest.algorithms;
import com.pathquest.model.PathResult;
import java.util.*;
public class DFS {
    private static final int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
    public PathResult run(int[][] grid, int startRow, int startCol, int endRow, int endCol) {
        long startTime = System.nanoTime();
        Stack<int[]> stack = new Stack<>();
        boolean[][] visited = new boolean[grid.length][grid[0].length];
        Map<String, String> parentMap = new HashMap<>();
        List<int[]> visitedNodes = new ArrayList<>();
        int stepsExplored = 0;
        stack.push(new int[]{startRow, startCol});
        visited[startRow][startCol] = true;
        boolean pathFound = false;
        while (!stack.isEmpty()) {
            int[] current = stack.pop();
            int r = current[0];
            int c = current[1];
            stepsExplored++;
            visitedNodes.add(new int[]{r, c});
            if (r == endRow && c == endCol) {
                pathFound = true;
                break;
            }
            String currentKey = r + "," + c;
            for (int[] d : DIRS) {
                int nr = r + d[0];
                int nc = c + d[1];
                if (isValid(nr, nc, grid) && !visited[nr][nc] && grid[nr][nc] == 0) {
                    visited[nr][nc] = true;
                    stack.push(new int[]{nr, nc});
                    String childKey = nr + "," + nc;
                    parentMap.put(childKey, currentKey);
                }
            }
        }
        List<int[]> path = new ArrayList<>();
        if (pathFound) {
            path = reconstructPath(parentMap, startRow + "," + startCol, endRow + "," + endCol);
        }
        long timeTaken = (System.nanoTime() - startTime) / 1_000_000;
        return new PathResult("DFS", path.size(), stepsExplored, timeTaken, pathFound, path, visitedNodes);
    }
    private boolean isValid(int row, int col, int[][] grid) {
        return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
    }
    private List<int[]> reconstructPath(Map<String, String> parentMap, String startKey, String endKey) {
        List<int[]> path = new ArrayList<>();
        String current = endKey;
        while (current != null) {
            String[] parts = current.split(",");
            path.add(new int[]{Integer.parseInt(parts[0]), Integer.parseInt(parts[1])});
            if (current.equals(startKey)) {
                break;
            }
            current = parentMap.get(current);
        }
        Collections.reverse(path);
        return path;
    }
}