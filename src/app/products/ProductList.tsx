// src/app/products/ProductList.tsx
"use client";


export type ProductListItem = {
    id: string;
    title: string;
    description: string;
    images: string[];
    startingBid: number;
    currentBid: number;
    auctionEnd: string; // serialized Date from server
    location: string;
    status: string; // "ACTIVE" | "ENDED" | "CANCELLED"
};

type ProductListProps = {
    products: ProductListItem[];
};

/**
 * CLIENT COMPONENT
 * --------------------------------------------------
 * This component:
 *  - Receives products as props from the server
 *  - Renders the grid of product cards
 */
export default function ProductList({ products }: ProductListProps) {
    if (products.length === 0) {
        return <p>No products available yet.</p>;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
            }}
        >
            {products.map((product) => (
                <div
                    key={product.id}
                    style={{ border: "1px solid #ddd", padding: "15px" }}
                >
                    {/* Main image */}
                    {product.images && product.images.length > 0 && (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                marginBottom: "10px",
                            }}
                        />
                    )}

                    {/* Title & description */}
                    <h3>{product.title}</h3>
                    <p style={{ fontSize: "14px", color: "#666" }}>
                        {product.description}
                    </p>

                    {/* Price / bids / info */}
                    <p>
                        <strong>Starting Bid:</strong> ${product.startingBid}
                    </p>
                    <p>
                        <strong>Current Bid:</strong> ${product.currentBid}
                    </p>
                    <p>
                        <strong>Location:</strong> {product.location}
                    </p>
                    <p>
                        <strong>Status:</strong> {product.status}
                    </p>
                    <p>
                        <strong>Ends:</strong>{" "}
                        {new Date(product.auctionEnd).toLocaleString()}
                    </p>

                    {/* Image count hint */}
                    {product.images && product.images.length > 1 && (
                        <p style={{ fontSize: "12px", color: "#999" }}>
                            +{product.images.length - 1} more image(s)
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
