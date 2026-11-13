package br.edu.atitus.productapi.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SearchTextTest {

    @Test
    void removesAccentsAndLowercases() {
        assertEquals("explosoes retro", SearchText.normalize("  Explosões Retrô "));
    }

    @Test
    void nullBecomesEmpty() {
        assertEquals("", SearchText.normalize(null));
    }

    @Test
    void buildIncludesTitleDescriptionAndCategory() {
        String text = SearchText.build("Troll Mutante", "Sprite animado", "Criaturas");
        assertTrue(text.contains("troll"));
        assertTrue(text.contains("animado"));
        assertTrue(text.contains("criaturas"));
    }
}
