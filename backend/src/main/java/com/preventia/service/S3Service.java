package com.preventia.service;

import com.preventia.config.PreventiaProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {

    private static final Logger log = LoggerFactory.getLogger(S3Service.class);

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final PreventiaProperties props;

    public S3Service(S3Client s3Client, S3Presigner s3Presigner, PreventiaProperties props) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.props = props;
    }

    /**
     * Uploads a prescription PDF to S3 under the "prescriptions/" prefix.
     *
     * @param pdfBytes raw PDF bytes
     * @return the S3 object key (e.g. "prescriptions/{uuid}.pdf")
     */
    public String uploadPrescriptionPdf(byte[] pdfBytes, UUID prescriptionId) {
        String key = "prescriptions/" + prescriptionId + ".pdf";
        String bucket = props.getAws().getS3().getBucketName();

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType("application/pdf")
                .serverSideEncryption(software.amazon.awssdk.services.s3.model.ServerSideEncryption.AES256)
                .build();

        s3Client.putObject(putRequest, RequestBody.fromBytes(pdfBytes));
        log.info("Uploaded prescription PDF to s3://{}/{}", bucket, key);
        return key;
    }

    /**
     * Generates a pre-signed GET URL valid for the configured expiry (default 15 min).
     */
    public URL generatePresignedUrl(String s3Key) {
        long expiryMinutes = props.getAws().getS3().getPresignedUrlExpiryMinutes();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(expiryMinutes))
                .getObjectRequest(GetObjectRequest.builder()
                        .bucket(props.getAws().getS3().getBucketName())
                        .key(s3Key)
                        .build())
                .build();

        URL url = s3Presigner.presignGetObject(presignRequest).url();
        log.debug("Generated pre-signed URL for key '{}', expires in {} min", s3Key, expiryMinutes);
        return url;
    }

    public void deleteObject(String s3Key) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(props.getAws().getS3().getBucketName())
                .key(s3Key)
                .build());
        log.info("Deleted S3 object '{}'", s3Key);
    }
}
