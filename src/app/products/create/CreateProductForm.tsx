// src/app/products/create/CreateProductForm.tsx

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [auctionEnd, setAuctionEnd] = useState("");
  const [location, setLocation] = useState<"Beirut" | "Outside Beirut">(
    "Beirut"
  );
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Upload images first
      const imageUrls: string[] = [];

      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.message || "Image upload failed");
        }

        const uploadData = await uploadRes.json();
        imageUrls.push(uploadData.url);
      }

      // Step 2: Create product with image URLs
      const productData = {
        title,
        description,
        startingBid: parseFloat(startingBid),
        auctionEnd: new Date(auctionEnd),
        location,
        images: imageUrls,
      };

      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!productRes.ok) {
        const errData = await productRes.json();
        throw new Error(errData.message || "Product creation failed");
      }

      const result = await productRes.json();
      setSuccess("Product created successfully!");

      // Redirect to my products after 2 seconds
      setTimeout(() => {
        router.push("/products/my-products");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <h1>Create New Product</h1>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            color: "green",
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid green",
            borderRadius: "4px",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="title">Title:</label>
          <br />
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="description">Description:</label>
          <br />
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="startingBid">Starting Bid ($):</label>
          <br />
          <input
            type="number"
            id="startingBid"
            value={startingBid}
            onChange={(e) => setStartingBid(e.target.value)}
            required
            min="0"
            step="0.01"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="auctionEnd">Auction End Date:</label>
          <br />
          <input
            type="datetime-local"
            id="auctionEnd"
            value={auctionEnd}
            onChange={(e) => setAuctionEnd(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="location">Location:</label>
          <br />
          <select
            id="location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value as "Beirut" | "Outside Beirut")
            }
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="Beirut">Beirut</option>
            <option value="Outside Beirut">Outside Beirut</option>
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="images">Product Images (multiple):</label>
          <br />
          <input
            type="file"
            id="images"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            required
            style={{ marginTop: "5px" }}
          />
          {images.length > 0 && (
            <p style={{ marginTop: "5px", fontSize: "14px", color: "#666" }}>
              {images.length} image(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
