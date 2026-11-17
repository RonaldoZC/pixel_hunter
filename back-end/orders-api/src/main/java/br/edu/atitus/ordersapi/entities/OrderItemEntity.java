package br.edu.atitus.ordersapi.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_order_item")
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    /** Título e preço são copiados do produto no momento da compra (histórico não muda depois). */
    @Column(nullable = false)
    private String title;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Dono do produto quando foi vendido; nulo em itens anteriores ao histórico de vendas. */
    @Column(name = "seller_id")
    private Long sellerId;

    public Long getId() {
        return id;
    }

    public OrderEntity getOrder() {
        return order;
    }

    void setOrder(OrderEntity order) {
        this.order = order;
    }

    public Long getAssetId() {
        return assetId;
    }

    public void setAssetId(Long assetId) {
        this.assetId = assetId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }
}
