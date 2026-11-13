package br.edu.atitus.authapi.controllers;

import br.edu.atitus.authapi.components.JwtUtil;
import br.edu.atitus.authapi.dtos.SigninRequestDto;
import br.edu.atitus.authapi.dtos.SigninResponseDto;
import br.edu.atitus.authapi.dtos.SignupRequestDto;
import br.edu.atitus.authapi.dtos.UserResponseDto;
import br.edu.atitus.authapi.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signup(@RequestBody SignupRequestDto dto) {
        var user = userService.signup(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponseDto.fromEntity(user));
    }

    @PostMapping("/signin")
    public SigninResponseDto signin(@RequestBody SigninRequestDto dto) {
        var user = userService.authenticate(dto.email(), dto.password());
        return new SigninResponseDto(UserResponseDto.fromEntity(user), jwtUtil.generateToken(user));
    }
}
