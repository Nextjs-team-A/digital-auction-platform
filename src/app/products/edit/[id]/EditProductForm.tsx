// src/app/products/edit/[id]/EditProductForm.tsx

/**
 * EditProductForm Component
 * ---------------------------------------------------------
 * Client-side form for editing an existing product
 *
 * Features:
 * - Pre-fills form with existing product data
 * - Allows editing all product fields (title, description, location, etc.)
 * - Supports adding new images or keeping existing ones
 * - Validates data before submission
 * - Redirects to my-products page after successful update
 *
 * Security:
 * - Uses authenticated API routes
 * - Only product owner can edit (enforced by API)
 */

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

// Define Product interface to match database schema
interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  startingBid: number;
  currentBid: number;
  auctionEnd: string;
  location: "Beirut" | "Outside Beirut";
  status: string;
}

interface EditProductFormProps {
  productId: string;
}

export default function EditProductForm({ productId }: EditProductFormProps) {
  const router = useRouter();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form field states - initialized with existing product data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [auctionEnd, setAuctionEnd] = useState("");
  const [location, setLocation] = useState<"Beirut" | "Outside Beirut">(
    "Beirut"
  );

  // Image handling states
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [keepExistingImages, setKeepExistingImages] = useState(true);

  /**
   * Fetch existing product data on component mount
   * This pre-fills the form with current product information
   */
  useEffect(() => {
    fetchProductData();
  }, [productId]);

  /**
   * Fetches the current product data from the API
   * Populates all form fields with existing values
   */
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/products/${productId}`);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch product");
      }

      const product: Product = await res.json();

      // Pre-fill form fields with existing data
      setTitle(product.title);
      setDescription(product.description);
      setStartingBid(product.startingBid.toString());
      setLocation(product.location);
      setExistingImages(product.images || []);

      // Convert ISO date string to datetime-local format (YYYY-MM-DDTHH:mm)
      const auctionDate = new Date(product.auctionEnd);
      const formattedDate = auctionDate.toISOString().slice(0, 16);
      setAuctionEnd(formattedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
      console.error("Fetch product error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles new image file selection
   * Allows user to add new images to the product
   */
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  /**
   * Handles form submission
   * Uploads new images (if any) and updates product data
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Build the final images array
      let finalImages: string[] = [];

      // Keep existing images if user wants to retain them
      if (keepExistingImages) {
        finalImages = [...existingImages];
      }

      // Step 2: Upload new images if any were selected
      if (newImages.length > 0) {
        for (const image of newImages) {
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
          finalImages.push(uploadData.url);
        }
      }

      // Step 3: Prepare updated product data
      const updatedProductData = {
        title,
        description,
        startingBid: parseFloat(startingBid),
        auctionEnd: new Date(auctionEnd).toISOString(), // Convert to ISO string for validation
        location,
        images: finalImages.length > 0 ? finalImages : undefined, // Only send if images exist
      };

      console.log("Sending update data:", updatedProductData);

      // Step 4: Send update request to API
      const productRes = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProductData),
      });

      if (!productRes.ok) {
        const errData = await productRes.json();
        console.error("Update failed:", errData);

        // Show detailed validation errors if available
        if (errData.errors) {
          const errorMessages = Object.entries(errData.errors)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
            )
            .join("\n");
          throw new Error(`Validation failed:\n${errorMessages}`);
        }

        throw new Error(errData.message || "Product update failed");
      }

      const result = await productRes.json();
      setSuccess("Product updated successfully!");

      // Redirect to my products page after 2 seconds
      setTimeout(() => {
        router.push("/products/my-products");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      console.error("Update product error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching product data
  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
        <p>Loading product data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
      <h1>Edit Product</h1>

      {/* Error message display */}
      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "4px",
            backgroundColor: "#fee",
          }}
        >
          {error}
        </div>
      )}

      {/* Success message display */}
      {success && (
        <div
          style={{
            color: "green",
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid green",
            borderRadius: "4px",
            backgroundColor: "#efe",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="title">
            Title: <span style={{ color: "red" }}>*</span>
          </label>
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

        {/* Description Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="description">
            Description: <span style={{ color: "red" }}>*</span>
          </label>
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

        {/* Starting Bid Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="startingBid">
            Starting Bid ($): <span style={{ color: "red" }}>*</span>
          </label>
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

        {/* Auction End Date Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="auctionEnd">
            Auction End Date: <span style={{ color: "red" }}>*</span>
          </label>
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

        {/* Location Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="location">
            Location: <span style={{ color: "red" }}>*</span>
          </label>
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

        {/* Existing Images Display */}
        {existingImages.length > 0 && (
          <div style={{ marginBottom: "15px" }}>
            <label>Current Images:</label>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                flexWrap: "wrap",
              }}
            >
              {existingImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product image ${index + 1}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
              ))}
            </div>

            {/* Checkbox to keep or remove existing images */}
            <div style={{ marginTop: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={keepExistingImages}
                  onChange={(e) => setKeepExistingImages(e.target.checked)}
                  style={{ marginRight: "5px" }}
                />
                Keep existing images
              </label>
            </div>
          </div>
        )}

        {/* New Images Upload */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="newImages">Add New Images (optional):</label>
          <br />
          <input
            type="file"
            id="newImages"
            onChange={handleNewImageChange}
            accept="image/*"
            multiple
            style={{ marginTop: "5px" }}
          />
          {newImages.length > 0 && (
            <p style={{ marginTop: "5px", fontSize: "14px", color: "#666" }}>
              {newImages.length} new image(s) selected
            </p>
          )}
        </div>

        {/* Form Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1,
              padding: "10px 20px",
              backgroundColor: submitting ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Updating..." : "Update Product"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/products/my-products")}
            style={{
              flex: 1,
              padding: "10px 20px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
