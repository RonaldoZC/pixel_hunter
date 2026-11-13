package br.edu.atitus.productapi.util;

import java.text.Normalizer;
import java.util.Locale;

/** Normalização usada na busca: minúsculas e sem acentos ("Explosões" -> "explosoes"). */
public final class SearchText {

    private SearchText() {
    }

    public static String normalize(String text) {
        if (text == null) {
            return "";
        }
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    /** Texto indexado de um produto: título, descrição e nome da categoria. */
    public static String build(String title, String description, String categoryName) {
        return normalize(title + " " + description + " " + categoryName);
    }
}
