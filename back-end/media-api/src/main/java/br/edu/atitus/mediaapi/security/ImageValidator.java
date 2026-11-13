package br.edu.atitus.mediaapi.security;

import br.edu.atitus.mediaapi.exceptions.ApiException;
import org.springframework.http.HttpStatus;

import java.util.Locale;

/**
 * Valida o upload pelo content-type declarado E pelos primeiros bytes do arquivo (assinatura),
 * para que um arquivo qualquer renomeado para .png não passe.
 */
public final class ImageValidator {

    public static final long MAX_BYTES = 5L * 1024 * 1024;

    private ImageValidator() {
    }

    public static ImageType validate(String declaredContentType, byte[] content) {
        if (content == null || content.length == 0) {
            throw bad("Envie um arquivo de imagem.");
        }
        if (content.length > MAX_BYTES) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Imagem muito grande. O tamanho máximo é 5 MB.");
        }
        ImageType detected = detect(content);
        if (detected == null) {
            throw bad("Formato não suportado. Use PNG, JPG ou WebP.");
        }
        String declared = declaredContentType == null ? "" : declaredContentType.toLowerCase(Locale.ROOT).trim();
        if (declared.equals("image/jpg")) declared = "image/jpeg";
        if (!declared.equals(detected.contentType())) {
            throw bad("O tipo do arquivo não corresponde ao seu conteúdo.");
        }
        return detected;
    }

    static ImageType detect(byte[] b) {
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A) {
            return ImageType.PNG;
        }
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return ImageType.JPEG;
        }
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return ImageType.WEBP;
        }
        return null;
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
