package com.pathquest.repository;

import com.pathquest.model.LeaderboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaderboardRepository extends JpaRepository<LeaderboardEntry, Long> {
    
    // Find top entries by difficulty, ordered by efficiency descending, then timeTaken ascending
    List<LeaderboardEntry> findTop10ByDifficultyOrderByEfficiencyDescTimeTakenAsc(String difficulty);

}
