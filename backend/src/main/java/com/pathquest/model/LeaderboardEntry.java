package com.pathquest.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "leaderboard")
public class LeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String playerName;
    private String difficulty; // Easy, Medium, Hard
    private int pathLength;
    private int stepsExplored;
    private int timeTaken;
    private int efficiency;

    // Default constructor for JPA
    public LeaderboardEntry() {
    }

    public LeaderboardEntry(String playerName, String difficulty, int pathLength, int stepsExplored, int timeTaken, int efficiency) {
        this.playerName = playerName;
        this.difficulty = difficulty;
        this.pathLength = pathLength;
        this.stepsExplored = stepsExplored;
        this.timeTaken = timeTaken;
        this.efficiency = efficiency;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public int getPathLength() {
        return pathLength;
    }

    public void setPathLength(int pathLength) {
        this.pathLength = pathLength;
    }

    public int getStepsExplored() {
        return stepsExplored;
    }

    public void setStepsExplored(int stepsExplored) {
        this.stepsExplored = stepsExplored;
    }

    public int getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(int timeTaken) {
        this.timeTaken = timeTaken;
    }

    public int getEfficiency() {
        return efficiency;
    }

    public void setEfficiency(int efficiency) {
        this.efficiency = efficiency;
    }
}
