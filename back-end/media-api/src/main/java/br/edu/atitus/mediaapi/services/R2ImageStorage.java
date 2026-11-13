package br.edu.atitus.mediaapi.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class R2ImageStorage implements ImageStorage {

    private final S3Client s3Client;
    private final String bucket;
    private final String publicUrl;

    public R2ImageStorage(
            S3Client s3Client,
            @Value("${cloudflare.r2.bucket}") String bucket,
            @Value("${cloudflare.r2.public-url}") String publicUrl) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.publicUrl = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
    }

    @Override
    public String store(String objectKey, String contentType, byte[] content) {
        var request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(contentType)
                .build();
        s3Client.putObject(request, RequestBody.fromBytes(content));
        return publicUrl + "/" + objectKey;
    }
}
