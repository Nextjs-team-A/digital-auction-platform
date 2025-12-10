"use client";

/**
 * EditProductForm.tsx (CLIENT)
 * - Prefills with server-provided initialData
 * - Shows image previews
 * - Allows basic edits (title, description, category, price, endsAt, status)
 * - Displays currentBid (read-only)
 * - Submits PUT /api/products/[id]
 *
 * NOTE:
 *  - Images are treated as URL strings (per your current data model).
 *  - If your project has an Upload API, you can replace the "Add image by URL" with that flow later.
 */

import * as React from "react";
import { useRouter } from "next/navigation";

type InitialData = {
  title: string;
  description: string;
  images: string[];
  price: number;
  currentBid: number | null;
  endsAt: string; // ISO date string
  category: string;
  status: string; // e.g., "DRAFT" | "ACTIVE" | "ENDED"
};

export default function EditProductForm({
  productId,
  initialData,
}: {
  productId: string;
  initialData: InitialData;
}) {
  const router = useRouter();

  // Local form state
  const [title, setTitle] = React.useState(initialData.title ?? "");
  const [description, setDescription] = React.useState(initialData.description ?? "");
  const [category, setCategory] = React.useState(initialData.category ?? "");
  const [status, setStatus] = React.useState(initialData.status ?? "DRAFT");
  const [price, setPrice] = React.useState<number>(initialData.price ?? 0);

  // Keep images in state so we can add/remove previews
  const [images, setImages] = React.useState<string[]>(initialData.images ?? []);

  // Convert endsAt (ISO) to `datetime-local` value
  const toLocalInputValue = (iso: string) => {
    try {
      const d = new Date(iso);
      // Pad helper
      const pad = (n: number) => String(n).padStart(2, "0");
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
      return "";
    }
  };

  const [endsAtLocal, setEndsAtLocal] = React.useState<string>(toLocalInputValue(initialData.endsAt));

  // UI state
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = React.useState("");

  const addImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setImages((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };
  const removeImageAt = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Convert `datetime-local` back to ISO
  const localToIso = (localValue: string) => {
    // localValue is like "2025-12-10T18:30"
    if (!localValue) return initialData.endsAt;
    const d = new Date(localValue);
    return d.toISOString();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Mapping your form to API fields:
        // - price -> startingBid
        // - endsAtLocal -> auctionEnd (ISO)
        body: JSON.stringify({
          title,
          description,
          images,
          price, // startingBid server-side
          category,
          status,
          endsAt: localToIso(endsAtLocal), // auctionEnd server-side
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Update failed (${res.status})`);
      }

      // Success → back to my-products
      router.push("/products/my-products?updated=1");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 space-y-4">
      {err && (
        <div style={{ background: "#fee", color: "#900", padding: "8px", borderRadius: 6 }}>
          {err}
        </div>
      )}

      {/* Read-only info */}
      <div className="text-sm text-gray-600">
        <div>
          <b>Current Bid:</b> {initialData.currentBid ?? "-"}
        </div>
        <div>
          <b>Ends At:</b> {new Date(initialData.endsAt).toLocaleString()}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      {/* Category & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="electronics, fashion, ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ENDED">ENDED</option>
          </select>
        </div>
      </div>

      {/* Price & EndsAt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Starting Price</label>
          <input
            type="number"
            value={Number.isFinite(price) ? price : 0}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            min={0}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Auction Ends (local)</label>
          <input
            type="datetime-local"
            value={endsAtLocal}
            onChange={(e) => setEndsAtLocal(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Image previews */}
      <div>
        <label className="block text-sm font-medium mb-2">Images</label>

        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((src, idx) => (
              <div key={idx} className="relative">
                <img
                  src={src}
                  alt={`image-${idx}`}
                  className="w-24 h-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImageAt(idx)}
                  className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full px-2 py-0.5"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No images yet.</div>
        )}

        {/* Add by URL (simple) — replace with your Upload API later if needed */}
        <div className="mt-3 flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={addImageUrl}
            className="px-3 py-2 rounded border bg-gray-100"
          >
            Add
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded border"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
