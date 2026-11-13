package br.edu.atitus.authapi.controllers;

import br.edu.atitus.authapi.dtos.UpdatePhotoRequestDto;
import br.edu.atitus.authapi.dtos.UpdateProfileRequestDto;
import br.edu.atitus.authapi.dtos.UserResponseDto;
import br.edu.atitus.authapi.exceptions.ApiException;
import br.edu.atitus.authapi.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Perfil do usuário logado. O gateway valida o JWT e envia o id em X-User-Id. */
@RestController
@RequestMapping("/ws/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public UserResponseDto me(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        return UserResponseDto.fromEntity(userService.getById(currentUserId(userId)));
    }

    @PutMapping
    public UserResponseDto update(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody UpdateProfileRequestDto dto) {
        return UserResponseDto.fromEntity(userService.updateProfile(currentUserId(userId), dto));
    }

    @PutMapping("/photo")
    public UserResponseDto updatePhoto(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody UpdatePhotoRequestDto dto) {
        return UserResponseDto.fromEntity(userService.updatePhoto(currentUserId(userId), dto));
    }

    private static Long currentUserId(String header) {
        try {
            return Long.valueOf(header == null ? "" : header.trim());
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Autenticação necessária.");
        }
    }
}
