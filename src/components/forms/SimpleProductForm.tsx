import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { useLanguage } from "@/i18n/LanguageContext";

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
    validUntil?: string;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const categories = [
  { value: "Electronics", labelKey: "products.categories.electronics" },
  { value: "Mobile Phones", labelKey: "products.categories.mobilePhones" },
  { value: "Laptops", labelKey: "products.categories.laptops" },
  { value: "Accessories", labelKey: "products.categories.accessories" },
  { value: "Home Appliances", labelKey: "products.categories.homeAppliances" },
  { value: "Fashion", labelKey: "products.categories.fashion" },
  { value: "Grocery", labelKey: "products.categories.grocery" },
  { value: "Health & Beauty", labelKey: "products.categories.healthBeauty" },
  { value: "Sports", labelKey: "products.categories.sports" },
  { value: "Books", labelKey: "products.categories.books" },
  { value: "Toys & Games", labelKey: "products.categories.toysGames" },
  { value: "Kitchen & Dining", labelKey: "products.categories.kitchenDining" },
  { value: "Furniture", labelKey: "products.categories.furniture" },
  { value: "Stationery", labelKey: "products.categories.stationery" },
  { value: "Automotive", labelKey: "products.categories.automotive" },
  { value: "Other", labelKey: "products.categories.other" },
];

export function SimpleProductForm({ initialData, onSubmit, onCancel, isEditing }: SimpleProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t } = useLanguage();
  
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
  const [validUntil, setValidUntil] = useState(initialData?.validUntil || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const data = {
      name: name.trim(),
      currentPrice: parseFloat(price),
      stock: parseInt(stock),
      costPrice: costPrice ? parseFloat(costPrice) : 0,
      category: category.trim(),
      sku: sku.trim() || `PROD-${Date.now()}`,
      amazonUrl: amazonUrl.trim() || undefined,
      flipkartUrl: flipkartUrl.trim() || undefined,
      keywords: (keywords.trim() || name.trim()), // Use name as default keywords
      validUntil: validUntil.trim() || null, // Product validity/expiry date
    };
    
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label={isEditing ? "Edit product form" : "Add product form"}>
      {/* Basic Fields */}
      <div>
        <label htmlFor="product-name" className="text-sm font-medium mb-2 block">
          {t('products.productName')} <span className="text-destructive" aria-label="required">*</span>
        </label>
        <Input
          id="product-name"
          placeholder={t('products.productNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 text-base"
          required
          autoFocus
          aria-required="true"
          aria-describedby="product-name-hint"
        />
        <span id="product-name-hint" className="sr-only">Enter the name of your product</span>
      </div>

      <div>
        <label htmlFor="product-price" className="text-sm font-medium mb-2 block">
          {t('products.sellingPrice')} <span className="text-destructive" aria-label="required">*</span>
        </label>
        <Input
          id="product-price"
          type="number"
          placeholder={t('products.sellingPricePlaceholder')}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-12 text-base"
          required
          min="0"
          step="0.01"
          aria-required="true"
          aria-describedby="product-price-hint"
        />
        <span id="product-price-hint" className="sr-only">Enter your selling price in rupees</span>
      </div>

      <div>
        <label htmlFor="product-stock" className="text-sm font-medium mb-2 block">
          {t('products.stock')} <span className="text-destructive" aria-label="required">*</span>
        </label>
        <Input
          id="product-stock"
          type="number"
          placeholder={t('products.stockPlaceholder')}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="h-12 text-base"
          required
          min="0"
          aria-required="true"
          aria-describedby="product-stock-hint"
        />
        <span id="product-stock-hint" className="sr-only">Enter how many units you have in stock</span>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        aria-expanded={showAdvanced}
        aria-controls="advanced-options"
      >
        {showAdvanced ? (
          <>
            <ChevronUp className="w-4 h-4" />
            {t('products.hideAdvanced')}
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            {t('products.showAdvanced')}
          </>
        )}
      </button>

      {/* Advanced Fields (Collapsible) */}
      {showAdvanced && (
        <div id="advanced-options" className="space-y-4 pt-2 border-t border-border">
          <div>
            <label htmlFor="cost-price" className="text-sm font-medium mb-2 flex items-center gap-2">
              {t('products.costPrice')}
              <HelpTooltip content="What you paid for this product. Helps calculate profit margins." />
            </label>
            <Input
              id="cost-price"
              type="number"
              placeholder={t('products.costPricePlaceholder')}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="h-12 text-base"
              min="0"
              step="0.01"
              aria-describedby="cost-price-hint"
            />
            <span id="cost-price-hint" className="sr-only">Optional: Enter what you paid for this product</span>
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium mb-2 block">
              {t('products.category')}
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-3 rounded-xl bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-describedby="category-hint"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {t(cat.labelKey)}
                </option>
              ))}
            </select>
            <span id="category-hint" className="sr-only">Select the product category</span>
          </div>

          <div>
            <label htmlFor="sku" className="text-sm font-medium mb-2 flex items-center gap-2">
              {t('products.sku')}
              <HelpTooltip content="Your internal product code. Auto-generated if left empty." />
            </label>
            <Input
              id="sku"
              placeholder={t('products.skuPlaceholder')}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="h-12 text-base"
              aria-describedby="sku-hint"
            />
            <span id="sku-hint" className="sr-only">Optional: Enter your product code or leave empty for auto-generation</span>
          </div>

          <div>
            <label htmlFor="amazon-url" className="text-sm font-medium mb-2 flex items-center gap-2">
              {t('products.amazonUrl')}
              <HelpTooltip content="Link to this product on Amazon. Helps AI find exact matches for price tracking." />
            </label>
            <Input
              id="amazon-url"
              type="url"
              placeholder={t('products.amazonUrlPlaceholder')}
              value={amazonUrl}
              onChange={(e) => setAmazonUrl(e.target.value)}
              className="h-12 text-base"
              aria-describedby="amazon-url-hint"
            />
            <span id="amazon-url-hint" className="sr-only">Optional: Paste the Amazon product URL for price tracking</span>
          </div>

          <div>
            <label htmlFor="flipkart-url" className="text-sm font-medium mb-2 flex items-center gap-2">
              {t('products.flipkartUrl')}
              <HelpTooltip content="Link to this product on Flipkart for better price tracking." />
            </label>
            <Input
              id="flipkart-url"
              type="url"
              placeholder={t('products.flipkartUrlPlaceholder')}
              value={flipkartUrl}
              onChange={(e) => setFlipkartUrl(e.target.value)}
              className="h-12 text-base"
              aria-describedby="flipkart-url-hint"
            />
            <span id="flipkart-url-hint" className="sr-only">Optional: Paste the Flipkart product URL for price tracking</span>
          </div>

          <div>
            <label htmlFor="keywords" className="text-sm font-medium mb-2 flex items-center gap-2">
              {t('products.keywords')}
              <HelpTooltip content="Specific terms to help AI find this exact product (e.g., brand, model, size)." />
            </label>
            <Input
              id="keywords"
              placeholder={t('products.keywordsPlaceholder')}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="h-12 text-base"
              aria-describedby="keywords-hint"
            />
            <span id="keywords-hint" className="sr-only">Optional: Enter specific search terms to help find this product</span>
          </div>

          <div>
            <label htmlFor="valid-until" className="text-sm font-medium mb-2 flex items-center gap-2">
              {t('products.validUntil')}
              <HelpTooltip content="Expiry or discontinuation date. Alerts won't be generated after this date." />
            </label>
            <Input
              id="valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="h-12 text-base"
              min={new Date().toISOString().split('T')[0]}
              aria-describedby="valid-until-hint"
            />
            <span id="valid-until-hint" className="sr-only">Optional: Set expiry date for perishable or seasonal products</span>
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
          {t('products.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={loading || !name || !price || !stock}
          className="flex-1 h-12"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('products.saving')}
            </>
          ) : isEditing ? (
            t('products.updateProduct')
          ) : (
            t('products.addProduct')
          )}
        </Button>
      </div>
    </form>
  );
}
