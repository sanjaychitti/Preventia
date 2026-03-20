package com.preventia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class AwsConfig {

    private final PreventiaProperties props;

    public AwsConfig(PreventiaProperties props) {
        this.props = props;
    }

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(props.getAws().getRegion()))
                .credentialsProvider(DefaultCredentialsProvider.create());

        String override = props.getAws().getEndpointOverride();
        if (StringUtils.hasText(override)) {
            builder.endpointOverride(URI.create(override));
        }

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var builder = S3Presigner.builder()
                .region(Region.of(props.getAws().getRegion()))
                .credentialsProvider(DefaultCredentialsProvider.create());

        String override = props.getAws().getEndpointOverride();
        if (StringUtils.hasText(override)) {
            builder.endpointOverride(URI.create(override));
        }

        return builder.build();
    }
}
