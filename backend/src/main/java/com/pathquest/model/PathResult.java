package com.pathquest.model;
import java.util.List;
public class PathResult {
    private String name;
    private int pathLength;
    private int stepsExplored;
    private long timeTaken;
    private boolean pathFound;
    private List<int[]> path;
    private List<int[]> visitedNodes;
    public PathResult() {}
    public PathResult(String name, int pathLength, int stepsExplored, long timeTaken, boolean pathFound, List<int[]> path, List<int[]> visitedNodes) {
        this.name = name;
        this.pathLength = pathLength;
        this.stepsExplored = stepsExplored;
        this.timeTaken = timeTaken;
        this.pathFound = pathFound;
        this.path = path;
        this.visitedNodes = visitedNodes;
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getPathLength() { return pathLength; }
    public void setPathLength(int pathLength) { this.pathLength = pathLength; }
    public int getStepsExplored() { return stepsExplored; }
    public void setStepsExplored(int stepsExplored) { this.stepsExplored = stepsExplored; }
    public long getTimeTaken() { return timeTaken; }
    public void setTimeTaken(long timeTaken) { this.timeTaken = timeTaken; }
    public boolean isPathFound() { return pathFound; }
    public void setPathFound(boolean pathFound) { this.pathFound = pathFound; }
    public List<int[]> getPath() { return path; }
    public void setPath(List<int[]> path) { this.path = path; }
    public List<int[]> getVisitedNodes() { return visitedNodes; }
    public void setVisitedNodes(List<int[]> visitedNodes) { this.visitedNodes = visitedNodes; }
}