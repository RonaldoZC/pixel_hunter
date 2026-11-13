package br.edu.atitus.mediaapi.services;

import br.edu.atitus.mediaapi.exceptions.ApiException;
import br.edu.atitus.mediaapi.security.ImageValidator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class MediaService {

    private final ImageStorage storage;

    public MediaService(ImageStorage storage) {
        this.storage = storage;
    }

    /** Valida a imagem e a salva com nome gerado (UUID + extensão do tipo detectado, nunca o nome original). */
    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Envie um arquivo de imagem no campo \"file\".");
        }
        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Não foi possível ler o arquivo enviado.");
        }
        return upload(file.getContentType(), content);
    }

    String upload(String contentType, byte[] content) {
        var type = ImageValidator.validate(contentType, content);
        String key = UUID.randomUUID() + "." + type.extension();
        return storage.store(key, type.contentType(), content);
    }
}
