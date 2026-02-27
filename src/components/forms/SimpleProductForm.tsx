import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface SimpleProductFormProps {
  initialData?: {
    name: string;
    currentPrice: string;
    stock: string;
    costPrice?: string;
    category?: string;
    sku?: string;
    amazonUrl?: string;
    flipkartUrl?: string;
    keywords?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const categories = [
  "Electronics", "Mobile Phones", "Laptops", "Accessories", "Home Appliances",
  "Fashion", "Grocery", "Health & Beauty", "Sports", "Books", "Toys & Games",
  "Kitchen & Dining", "Furniture", "Stationery", "Automotive", "Other"
];

export function SimpleProductForm({ initialData, onSubmit, onCancel, isEditing }: SimpleProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Basic fields (always visible)
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.currentPrice || "");
  const [stock, setStock] = useState(initialData?.stock || "");
  
  // Advanced fields (collapsible)
  const [costPrice, setCostPrice] = useState(initialData?.costPrice || "");
  const [category, setCategory] = useState(initialData?.category || "Electronics");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [amazonUrl, setAmazonUrl] = useState(initialData?.amazonUrl || "");
  const [flipkartUrl, setFlipkartUrl] = useState(initialData?.flipkartUrl || "");
  const [keywords, setKeywords] = useState(initialData?.keywords || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      name,
      currentPrice: parseFloat(price),
      stock: parseInt(stock),
      costPrice: costPrice ? parseFloat(costPrice) : 0,
      category,
      sku: sku || `PROD-${Date.now()}`,
      amazonUrl: amazonUrl || undefined,
      flipkartUrl: flipkartUrl || undefined,
      keywords: keywords || name, // Use name as default keywords
    };
    
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Fields */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Product Name <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="e.g. Samsung Galaxy S24"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 text-base"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Your Selling Price (₹) <span className="text-destructive">*</span>
        </label>
        <Input
          type="number"
          placeholder="e.g. 129999"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-12 text-base"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Stock Quantity <span className="text-destructive">*</span>
        </label>
        <Input
          type="number"
          placeholder="e.g. 50"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="h-12 text-base"
          required
          min="0"
        />
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        {showAdvanced ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Advanced Options
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Show Advanced Options (optional)
          </>
        )}
      </button>

      {/* Advanced Fields (Collapsible) */}
      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Cost Price (₹)
            </label>
            <Input
              type="number"
              placeholder="What you paid for it"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="h-12 text-base"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Helps calculate profit margins
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Product Code / SKU
            </label>
            <Input
              placeholder="Auto-generated if empty"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Amazon Product URL
            </label>
            <Input
              placeholder="https://www.amazon.in/dp/..."
              value={amazonUrl}
              onChange={(e) => setAmazonUrl(e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">
              For better price tracking
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Flipkart Product URL
            </label>
            <Input
              placeholder="https://www.flipkart.com/..."
              value={flipkartUrl}
              onChange={(e) => setFlipkartUrl(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Search Keywords
            </label>
            <Input
              placeholder="e.g. Samsung Galaxy S24 256GB Black"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Helps find exact matches on competitor sites
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 h-12"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !name || !price || !stock}
          className="flex-1 h-12"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update Product"
          ) : (
            "Add Product"
          )}
        </Button>
      </div>
    </form>
  );
}
