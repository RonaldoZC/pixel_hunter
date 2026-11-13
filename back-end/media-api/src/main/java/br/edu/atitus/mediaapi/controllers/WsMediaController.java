package br.edu.atitus.mediaapi.controllers;

import br.edu.atitus.mediaapi.dtos.MediaResponse;
import br.edu.atitus.mediaapi.security.CurrentUser;
import br.edu.atitus.mediaapi.services.MediaService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Upload de imagens para qualquer usuário logado (o gateway valida o JWT). */
@RestController
@RequestMapping("/ws/media")
public class WsMediaController {

    private final MediaService service;

    public WsMediaController(MediaService service) {
        this.service = service;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MediaResponse upload(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Type", required = false) String userType,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        CurrentUser.from(userId, userType);
        return new MediaResponse(service.upload(file));
    }
}
