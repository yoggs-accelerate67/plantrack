package com.plantrack.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.plantrack.backend.model.User;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Add this lookup method
    java.util.Optional<User> findByEmail(String email);

    @Query("""
           SELECT DISTINCT u.department
           FROM User u
           WHERE u.department IS NOT NULL AND u.department <> ''
           ORDER BY u.department ASC
           """)
    List<String> findDistinctDepartments();
}