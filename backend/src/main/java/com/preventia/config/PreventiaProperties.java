package com.preventia.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "preventia")
public class PreventiaProperties {

    private final Jwt jwt = new Jwt();
    private final Aws aws = new Aws();
    private final Daily daily = new Daily();
    private final Razorpay razorpay = new Razorpay();

    public Jwt getJwt() { return jwt; }
    public Aws getAws() { return aws; }
    public Daily getDaily() { return daily; }
    public Razorpay getRazorpay() { return razorpay; }

    public static class Jwt {
        private String secret;
        private long expirationMs;
        private long recipientTokenExpirationMs;

        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public long getExpirationMs() { return expirationMs; }
        public void setExpirationMs(long expirationMs) { this.expirationMs = expirationMs; }
        public long getRecipientTokenExpirationMs() { return recipientTokenExpirationMs; }
        public void setRecipientTokenExpirationMs(long v) { this.recipientTokenExpirationMs = v; }
    }

    public static class Aws {
        private String region;
        private final S3 s3 = new S3();
        private String endpointOverride;

        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
        public S3 getS3() { return s3; }
        public String getEndpointOverride() { return endpointOverride; }
        public void setEndpointOverride(String endpointOverride) { this.endpointOverride = endpointOverride; }

        public static class S3 {
            private String bucketName;
            private long presignedUrlExpiryMinutes;

            public String getBucketName() { return bucketName; }
            public void setBucketName(String bucketName) { this.bucketName = bucketName; }
            public long getPresignedUrlExpiryMinutes() { return presignedUrlExpiryMinutes; }
            public void setPresignedUrlExpiryMinutes(long v) { this.presignedUrlExpiryMinutes = v; }
        }
    }

    public static class Daily {
        private String apiKey;
        private String apiUrl;
        private String roomPrivacy;
        private int roomExpirySeconds;

        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getApiUrl() { return apiUrl; }
        public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
        public String getRoomPrivacy() { return roomPrivacy; }
        public void setRoomPrivacy(String roomPrivacy) { this.roomPrivacy = roomPrivacy; }
        public int getRoomExpirySeconds() { return roomExpirySeconds; }
        public void setRoomExpirySeconds(int roomExpirySeconds) { this.roomExpirySeconds = roomExpirySeconds; }
    }

    /**
     * PRD §3 Tech Stack — Razorpay: Multi-currency (USD/INR) handling with default INR logic.
     */
    public static class Razorpay {
        private String keyId;
        private String keySecret;
        private String currency = "INR";

        public String getKeyId() { return keyId; }
        public void setKeyId(String keyId) { this.keyId = keyId; }
        public String getKeySecret() { return keySecret; }
        public void setKeySecret(String keySecret) { this.keySecret = keySecret; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }
}
