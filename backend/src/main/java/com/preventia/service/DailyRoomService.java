package com.preventia.service;

import com.preventia.config.PreventiaProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

/**
 * Thin client around the Daily.co REST API for room provisioning.
 */
@Service
public class DailyRoomService {

    private static final Logger log = LoggerFactory.getLogger(DailyRoomService.class);

    private final RestClient restClient;
    private final PreventiaProperties props;

    public DailyRoomService(PreventiaProperties props) {
        this.props = props;
        this.restClient = RestClient.builder()
                .baseUrl(props.getDaily().getApiUrl())
                .defaultHeader("Authorization", "Bearer " + props.getDaily().getApiKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * Creates a private Daily.co room for an appointment.
     *
     * @return RoomResult containing the room URL and name
     */
    public RoomResult createRoom(UUID appointmentId) {
        long expiryEpoch = (System.currentTimeMillis() / 1000L) + props.getDaily().getRoomExpirySeconds();

        Map<String, Object> body = Map.of(
                "name", "preventia-" + appointmentId,
                "privacy", props.getDaily().getRoomPrivacy(),
                "properties", Map.of(
                        "exp", expiryEpoch,
                        "enable_screenshare", false,
                        "enable_chat", true,
                        "start_video_off", false,
                        "start_audio_off", false
                )
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
                .uri("/rooms")
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("url")) {
            throw new IllegalStateException("Daily.co room creation returned unexpected response");
        }

        log.info("Created Daily.co room for appointment {}", appointmentId);
        return new RoomResult((String) response.get("url"), (String) response.get("name"));
    }

    /**
     * Deletes a Daily.co room (called after appointment completes or cancels).
     */
    public void deleteRoom(String roomName) {
        restClient.delete()
                .uri("/rooms/{name}", roomName)
                .retrieve()
                .toBodilessEntity();
        log.info("Deleted Daily.co room '{}'", roomName);
    }

    public record RoomResult(String url, String name) {}
}
