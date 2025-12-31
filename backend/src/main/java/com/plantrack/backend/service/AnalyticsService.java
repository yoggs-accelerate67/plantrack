package com.plantrack.backend.service;

import com.plantrack.backend.model.AnalyticsDTO;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.PlanStatus;
import com.plantrack.backend.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private PlanRepository planRepository;

    public AnalyticsDTO getUserAnalytics(Long userId) {
        // 1. Fetch all plans for the user
        List<Plan> userPlans = planRepository.findByUserUserId(userId);

        int totalPlans = userPlans.size();
        int completedPlans = 0;
        int pendingPlans = 0;

        // 2. Loop and Count
        for (Plan plan : userPlans) {
            if (plan.getStatus() == PlanStatus.COMPLETED) {
                completedPlans++;
            } else {
                pendingPlans++;
            }
        }

        // 3. Calculate Percentage (Avoid division by zero)
        double percentage = (totalPlans == 0) ? 0.0 : ((double) completedPlans / totalPlans) * 100;

        // 4. Return the Report
        return new AnalyticsDTO(totalPlans, completedPlans, pendingPlans, percentage);
    }
}