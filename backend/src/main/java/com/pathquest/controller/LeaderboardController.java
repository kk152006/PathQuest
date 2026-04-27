package com.pathquest.controller;

import com.pathquest.model.LeaderboardEntry;
import com.pathquest.repository.LeaderboardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "*") // Allows calls from frontend
public class LeaderboardController {

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @PostMapping
    public ResponseEntity<LeaderboardEntry> saveScore(@RequestBody LeaderboardEntry entry) {
        LeaderboardEntry saved = leaderboardRepository.save(entry);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{difficulty}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable String difficulty) {
        List<LeaderboardEntry> topScores = leaderboardRepository.findTop10ByDifficultyOrderByEfficiencyDescTimeTakenAsc(difficulty);
        return ResponseEntity.ok(topScores);
    }
}
