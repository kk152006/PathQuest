package com.pathquest.algorithms;

import com.pathquest.model.PathResult;

import java.util.*;

public class AStar {

    private static final int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    public PathResult run(int[][] grid, int startRow, int startCol, int endRow, int endCol) {
        long startTime = System.nanoTime();

        int rows = grid.length;
        int cols = grid[0].length;

        // pq stores {row, col, fScore}
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[2]));
        
        int[][] gScore = new int[rows][cols];
        for (int[] row : gScore) {
            Arrays.fill(row, Integer.MAX_VALUE);
        }
        
        boolean[][] visited = new boolean[rows][cols];
        Map<String, String> parentMap = new HashMap<>();

        List<int[]> visitedNodes = new ArrayList<>();
        int stepsExplored = 0;

        gScore[startRow][startCol] = 0;
        int startH = Math.abs(startRow - endRow) + Math.abs(startCol - endCol);
        pq.add(new int[]{startRow, startCol, startH});

        boolean pathFound = false;

        while (!pq.isEmpty()) {
            int[] current = pq.poll();
            int r = current[0];
            int c = current[1];

            // skip if already visited
            if (visited[r][c]) continue;
            
            visited[r][c] = true;
            stepsExplored++;
            visitedNodes.add(new int[]{r, c});

            if (r == endRow && c == endCol) {
                pathFound = true;
                break;
            }

            String currentKey = r + "," + c;

            for (int[] dir : DIRS) {
                int nr = r + dir[0];
                int nc = c + dir[1];

                if (isValid(nr, nc, grid) && grid[nr][nc] == 0) {
                    int tentative_g = gScore[r][c] + 1;
                    if (tentative_g < gScore[nr][nc]) {
                        gScore[nr][nc] = tentative_g;
                        String childKey = nr + "," + nc;
                        parentMap.put(childKey, currentKey);
                        
                        int h = Math.abs(nr - endRow) + Math.abs(nc - endCol);
                        int f = tentative_g + h;
                        pq.add(new int[]{nr, nc, f});
                    }
                }
            }
        }

        List<int[]> path = new ArrayList<>();
        if (pathFound) {
            path = reconstructPath(parentMap, startRow + "," + startCol, endRow + "," + endCol);
        }

        long timeTaken = (System.nanoTime() - startTime) / 1_000_000;

        return new PathResult("AStar", path.size(), stepsExplored, timeTaken, pathFound, path, visitedNodes);
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
