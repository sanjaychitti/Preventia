package com.preventia.service;

import com.preventia.domain.entity.Appointment;
import com.preventia.domain.entity.StaleTaskFlag;
import com.preventia.domain.enums.AppointmentStatus;
import com.preventia.domain.repository.AppointmentRepository;
import com.preventia.domain.repository.StaleTaskFlagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * PRD §9 Developer Safety Rail — Stale Task Lock:
 * "Tasks not completed within 12 hours of the window are flagged for Care Manager intervention."
 *
 * Runs every 30 minutes to check for overdue appointments.
 */
@Service
public class StaleTaskScheduler {

    private static final Logger log = LoggerFactory.getLogger(StaleTaskScheduler.class);
    private static final long STALE_THRESHOLD_HOURS = 12;

    private final AppointmentRepository appointmentRepository;
    private final StaleTaskFlagRepository staleTaskFlagRepository;

    public StaleTaskScheduler(AppointmentRepository appointmentRepository,
                               StaleTaskFlagRepository staleTaskFlagRepository) {
        this.appointmentRepository = appointmentRepository;
        this.staleTaskFlagRepository = staleTaskFlagRepository;
    }

    @Scheduled(fixedRate = 30 * 60 * 1000)  // every 30 minutes
    @Transactional
    public void flagStaleAppointments() {
        Instant cutoff = Instant.now().minus(STALE_THRESHOLD_HOURS, ChronoUnit.HOURS);

        List<Appointment> overdueAppointments = appointmentRepository.findAll().stream()
                .filter(a -> isOverdue(a, cutoff))
                .toList();

        for (Appointment appt : overdueAppointments) {
            boolean alreadyFlagged = staleTaskFlagRepository
                    .findByAppointmentIdAndResolvedFalse(appt.getId())
                    .isPresent();

            if (!alreadyFlagged) {
                StaleTaskFlag flag = StaleTaskFlag.builder()
                        .appointment(appt)
                        .deadlineAt(appt.getScheduledAt().plus(STALE_THRESHOLD_HOURS, ChronoUnit.HOURS))
                        .build();
                staleTaskFlagRepository.save(flag);
                log.warn("Stale task flagged for appointment {} (scheduled at {})",
                        appt.getId(), appt.getScheduledAt());
            }
        }
    }

    @Transactional
    public void resolveFlag(Appointment appointment, java.util.UUID resolvedById) {
        staleTaskFlagRepository.findByAppointmentIdAndResolvedFalse(appointment.getId())
                .ifPresent(flag -> {
                    flag.setResolved(true);
                    flag.setResolvedAt(Instant.now());
                    flag.setResolvedById(resolvedById);
                    staleTaskFlagRepository.save(flag);
                });
    }

    @Transactional(readOnly = true)
    public List<StaleTaskFlag> getOpenFlags() {
        return staleTaskFlagRepository.findByResolvedFalse();
    }

    private boolean isOverdue(Appointment appt, Instant cutoff) {
        return (appt.getStatus() == AppointmentStatus.REQUESTED
                || appt.getStatus() == AppointmentStatus.CONFIRMED)
                && appt.getScheduledAt().isBefore(cutoff);
    }
}
