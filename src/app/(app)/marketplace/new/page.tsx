"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "used", label: "Used" },
  { value: "fair", label: "Fair" },
];

export default function NewListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("used");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      price: Number(form.get("price")),
      categoryId,
      condition,
      images: [],
      location: String(form.get("location") || "") || undefined,
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      toast.success("Listing created!");
      router.push(`/marketplace/${data.listing.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-warmgray-500 hover:text-violet-700">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to marketplace
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">Create a listing</h1>
      <p className="mt-1 text-sm text-warmgray-500">Be specific and honest about condition — it builds your trust score.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 rounded-[var(--radius-card)] border border-warmgray-100 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required minLength={3} maxLength={120} placeholder="Engineering Mathematics by K.A. Stroud (5th Ed)" className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required minLength={10} maxLength={2000} rows={5} placeholder="Describe the item's condition, what's included, and why you're selling…" className="mt-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (₦)</Label>
            <Input id="price" name="price" type="number" required min={1} step="1" placeholder="4500" className="mt-1.5" />
          </div>
          <div>
            <Label>Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location (optional)</Label>
          <Input id="location" name="location" placeholder="Gidan Kwano, Hostel B" className="mt-1.5" />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading || !categoryId} className="mt-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish listing
        </Button>
      </form>
    </div>
  );
}
