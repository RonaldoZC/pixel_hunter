package br.edu.atitus.mediaapi.services;

/** Destino das imagens. Hoje é o Cloudflare R2; a interface permite trocar (e testar) sem tocar no resto. */
public interface ImageStorage {

    /** Salva o arquivo e devolve a URL pública. */
    String store(String objectKey, String contentType, byte[] content);
}
