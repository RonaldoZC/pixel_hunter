package br.edu.atitus.mediaapi.security;

/** Tipos de imagem aceitos, com o content-type e a extensão usada no nome do arquivo salvo. */
public enum ImageType {
    PNG("image/png", "png"),
    JPEG("image/jpeg", "jpg"),
    WEBP("image/webp", "webp");

    private final String contentType;
    private final String extension;

    ImageType(String contentType, String extension) {
        this.contentType = contentType;
        this.extension = extension;
    }

    public String contentType() {
        return contentType;
    }

    public String extension() {
        return extension;
    }
}
