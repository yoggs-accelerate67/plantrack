package com.plantrack.backend.service;

import com.plantrack.backend.model.*;
import com.plantrack.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PlanRepository planRepository;
    @Autowired
    private MilestoneRepository milestoneRepository;
    @Autowired
    private InitiativeRepository initiativeRepository;

    public Report generateDepartmentReport(String departmentName) {
        // 1. Find all Users in the Department
        List<User> deptUsers = userRepository.findAll().stream()
                .filter(u -> departmentName.equalsIgnoreCase(u.getDepartment()))
                .collect(Collectors.toList());

        if (deptUsers.isEmpty()) {
            throw new RuntimeException("No users found in department: " + departmentName);
        }

        List<Long> userIds = deptUsers.stream().map(User::getUserId).collect(Collectors.toList());

        // 2. Calculate Avg Goal (Plan) Completion
        // (Assuming a simple: If status is COMPLETED = 100%, else 0% for Plans, or more complex logic)
        List<Plan> deptPlans = planRepository.findAll().stream()
                .filter(p -> userIds.contains(p.getUser().getUserId()))
                .collect(Collectors.toList());

        double avgGoal = deptPlans.isEmpty() ? 0.0 : deptPlans.stream()
                .mapToDouble(p -> "COMPLETED".equals(p.getStatus()) ? 100.0 : 0.0)
                .average().orElse(0.0);

        // 3. Calculate Avg Milestone Completion (Using the % field we just added!)
        List<Milestone> deptMilestones = milestoneRepository.findAll().stream()
                .filter(m -> userIds.contains(m.getPlan().getUser().getUserId()))
                .collect(Collectors.toList());

        double avgMilestone = deptMilestones.isEmpty() ? 0.0 : deptMilestones.stream()
                .mapToDouble(Milestone::getCompletionPercent)
                .average().orElse(0.0);

        // 4. Calculate Avg Initiative Completion
        // (Simple: COMPLETED = 100, others = 0)
        List<Initiative> deptInitiatives = initiativeRepository.findAll().stream()
                .filter(i -> userIds.contains(i.getAssignedUser().getUserId()))
                .collect(Collectors.toList());

        double avgInitiative = deptInitiatives.isEmpty() ? 0.0 : deptInitiatives.stream()
                .mapToDouble(i -> "COMPLETED".equals(i.getStatus()) ? 100.0 : 0.0)
                .average().orElse(0.0);

        // 5. Create and Save Report
        ReportMetrics metrics = new ReportMetrics(avgGoal, avgMilestone, avgInitiative, deptUsers.size());
        Report report = new Report(departmentName, metrics);

        return reportRepository.save(report);
    }

    public List<Report> getReportsByDepartment(String department) {
        return reportRepository.findByScopeOrderByGeneratedDateDesc(department);
    }
}