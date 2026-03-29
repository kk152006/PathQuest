package com.pathquest.controller;

import com.pathquest.algorithms.BFS;
import com.pathquest.algorithms.DFS;
import com.pathquest.algorithms.Dijkstra;
import com.pathquest.algorithms.AStar;
import com.pathquest.model.PathRequest;
import com.pathquest.model.PathResult;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PathfindingController {

    @PostMapping("/run-algorithm")
    public PathResult runAlgorithm(@RequestBody PathRequest request) {
        if ("BFS".equalsIgnoreCase(request.getAlgorithm())) {
            return new BFS().run(
                request.getGrid(), 
                request.getStart().getRow(), 
                request.getStart().getCol(), 
                request.getEnd().getRow(), 
                request.getEnd().getCol()
            );
        } else if ("DFS".equalsIgnoreCase(request.getAlgorithm())) {
            return new DFS().run(
                request.getGrid(), 
                request.getStart().getRow(), 
                request.getStart().getCol(), 
                request.getEnd().getRow(), 
                request.getEnd().getCol()
            );
        } else if ("Dijkstra".equalsIgnoreCase(request.getAlgorithm())) {
            return new Dijkstra().run(
                request.getGrid(), 
                request.getStart().getRow(), 
                request.getStart().getCol(), 
                request.getEnd().getRow(), 
                request.getEnd().getCol()
            );
        } else if ("AStar".equalsIgnoreCase(request.getAlgorithm()) || "A*".equals(request.getAlgorithm())) {
            return new AStar().run(
                request.getGrid(), 
                request.getStart().getRow(), 
                request.getStart().getCol(), 
                request.getEnd().getRow(), 
                request.getEnd().getCol()
            );
        }
        
        // Return dummy for others
        return new PathResult(
                request.getAlgorithm() != null ? request.getAlgorithm() : "Unknown",
                0,
                0,
                0L,
                false,
                new ArrayList<>(),
                new ArrayList<>()
        );
    }
}
