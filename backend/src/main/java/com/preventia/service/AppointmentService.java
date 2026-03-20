package com.preventia.service;

import com.preventia.domain.entity.Appointment;
import com.preventia.domain.entity.User;
import com.preventia.domain.enums.AppointmentStatus;
import com.preventia.domain.repository.AppointmentRepository;
import com.preventia.domain.repository.UserRepository;
import com.preventia.dto.AppointmentRequest;
import com.preventia.dto.AppointmentResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DailyRoomService dailyRoomService;
    private final JwtService jwtService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                               UserRepository userRepository,
                               DailyRoomService dailyRoomService,
                               JwtService jwtService) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.dailyRoomService = dailyRoomService;
        this.jwtService = jwtService;
    }

    /**
     * Books an appointment; provisions a Daily.co room immediately.
     * Returns appointment ID + recipient token per Workflow 1.
     */
    public AppointmentResponse bookAppointment(AppointmentRequest req, User sponsor) {
        User recipient = userRepository.findById(req.recipientId())
                .orElseThrow(() -> new EntityNotFoundException("Recipient not found: " + req.recipientId()));
        User doctor = userRepository.findById(req.doctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found: " + req.doctorId()));

        Appointment appointment = Appointment.builder()
                .sponsor(sponsor)
                .recipient(recipient)
                .doctor(doctor)
                .scheduledAt(req.scheduledAt())
                .notes(req.notes())
                .status(AppointmentStatus.REQUESTED)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Provision Daily.co room
        DailyRoomService.RoomResult room = dailyRoomService.createRoom(appointment.getId());
        String recipientToken = jwtService.generateRecipientToken(appointment.getId(), recipient.getEmail());

        appointment.setDailyRoomUrl(room.url());
        appointment.setDailyRoomName(room.name());
        appointment.setRecipientToken(recipientToken);
        appointment = appointmentRepository.save(appointment);

        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(UUID appointmentId, User requester) {
        Appointment appointment = findOrThrow(appointmentId);
        assertCanAccess(appointment, requester);
        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listForSponsor(UUID sponsorId) {
        return appointmentRepository.findBySponsorIdOrderByScheduledAtDesc(sponsorId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listForDoctor(UUID doctorId) {
        return appointmentRepository.findByDoctorIdOrderByScheduledAtDesc(doctorId)
                .stream().map(this::toResponse).toList();
    }

    public AppointmentResponse updateStatus(UUID appointmentId, AppointmentStatus newStatus, User requester) {
        Appointment appointment = findOrThrow(appointmentId);
        assertCanAccess(appointment, requester);
        appointment.setStatus(newStatus);
        return toResponse(appointmentRepository.save(appointment));
    }

    // --- helpers ---

    private Appointment findOrThrow(UUID id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + id));
    }

    private void assertCanAccess(Appointment appointment, User requester) {
        boolean isParticipant = appointment.getSponsor().getId().equals(requester.getId())
                || appointment.getRecipient().getId().equals(requester.getId())
                || appointment.getDoctor().getId().equals(requester.getId());
        if (!isParticipant) {
            throw new AccessDeniedException("Not authorised to access this appointment");
        }
    }

    private AppointmentResponse toResponse(Appointment a) {
        return new AppointmentResponse(
                a.getId(),
                a.getSponsor().getId(),
                a.getRecipient().getId(),
                a.getDoctor().getId(),
                a.getDoctor().getFullName(),
                a.getScheduledAt(),
                a.getStatus(),
                a.getDailyRoomUrl(),
                a.getRecipientToken(),
                a.getNotes(),
                a.getCreatedAt()
        );
    }
}
