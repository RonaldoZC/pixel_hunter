package br.edu.atitus.mediaapi.services;

import br.edu.atitus.mediaapi.exceptions.ApiException;
import br.edu.atitus.mediaapi.security.ImageValidator;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class MediaServiceTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
    private static final byte[] JPG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0};
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};

    private final List<String> keys = new ArrayList<>();
    private final MediaService service = new MediaService((key, type, content) -> {
        keys.add(key);
        return "https://cdn.exemplo.com/" + key;
    });

    @Test
    void acceptsPngJpgAndWebpWhenContentTypeMatches() {
        assertTrue(service.upload("image/png", PNG).endsWith(".png"));
        assertTrue(service.upload("image/jpeg", JPG).endsWith(".jpg"));
        assertTrue(service.upload("image/webp", WEBP).endsWith(".webp"));
    }

    @Test
    void objectNameIsGeneratedNotUserSupplied() {
        service.upload("image/png", PNG);
        assertTrue(keys.get(0).matches("[0-9a-f-]{36}\\.png"));
    }

    @Test
    void rejectsContentThatIsNotAnImageEvenWithImageContentType() {
        byte[] script = "<?php echo 1; ?>".getBytes();
        var ex = assertThrows(ApiException.class, () -> service.upload("image/png", script));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void rejectsContentTypeThatDoesNotMatchSignature() {
        var ex = assertThrows(ApiException.class, () -> service.upload("image/jpeg", PNG));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void rejectsEmptyAndTooLargeFiles() {
        assertEquals(HttpStatus.BAD_REQUEST,
                assertThrows(ApiException.class, () -> service.upload("image/png", new byte[0])).getStatus());
        byte[] big = new byte[(int) ImageValidator.MAX_BYTES + 1];
        System.arraycopy(PNG, 0, big, 0, PNG.length);
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE,
                assertThrows(ApiException.class, () -> service.upload("image/png", big)).getStatus());
    }
}
