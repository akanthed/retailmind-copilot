import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingUp,
  Loader2,
  ExternalLink,
  IndianRupee,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient, Product } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  currentPrice: string;
  costPrice: string;
  stock: string;
  stockDays: string;
  amazonUrl: string;
  flipkartUrl: string;
  keywords: string;
}

const defaultForm: ProductFormData = {
  name: "",
  sku: "",
  category: "Electronics",
  currentPrice: "",
  costPrice: "",
  stock: "",
  stockDays: "",
  amazonUrl: "",
  flipkartUrl: "",
  keywords: "",
};

const categories = [
  "Electronics",
  "Mobile Phones",
  "Laptops",
  "Accessories",
  "Home Appliances",
  "Fashion",
  "Grocery",
  "Health & Beauty",
  "Sports",
  "Books",
  "Other",
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const result = await apiClient.getProducts();
      if (result.error) {
        toast({
          title: "Error loading products",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      setProducts(result.data?.products || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct() {
    if (!formData.name || !formData.currentPrice) {
      toast({
        title: "Missing fields",
        description: "Product name and price are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const productData: any = {
        name: formData.name,
        sku: formData.sku || undefined,
        category: formData.category,
        currentPrice: parseFloat(formData.currentPrice),
        costPrice: parseFloat(formData.costPrice) || 0,
        stock: parseInt(formData.stock) || 0,
        stockDays: parseInt(formData.stockDays) || 0,
        amazonUrl: formData.amazonUrl || undefined,
        flipkartUrl: formData.flipkartUrl || undefined,
        keywords: formData.keywords || undefined,
      };

      let result;
      if (editingProduct) {
        // Update existing product
        result = await apiClient.updateProduct(editingProduct.id, productData);
      } else {
        // Create new product
        result = await apiClient.createProduct(productData);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: editingProduct ? "Product Updated" : "Product Added",
        description: `${formData.name} has been ${editingProduct ? "updated" : "added"} successfully`,
      });

      setShowAddDialog(false);
      setEditingProduct(null);
      setFormData(defaultForm);
      loadProducts();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct() {
    if (!deletingProduct) return;

    try {
      const result = await apiClient.deleteProduct(deletingProduct.id);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Product Deleted",
        description: `${deletingProduct.name} has been removed`,
      });
      setShowDeleteDialog(false);
      setDeletingProduct(null);
      loadProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      currentPrice: String(product.currentPrice),
      costPrice: String(product.costPrice),
      stock: String(product.stock),
      stockDays: String(product.stockDays),
      amazonUrl: (product as any).amazonUrl || "",
      flipkartUrl: (product as any).flipkartUrl || "",
      keywords: (product as any).keywords || "",
    });
    setShowAddDialog(true);
  }

  function openAddDialog() {
    setEditingProduct(null);
    setFormData(defaultForm);
    setShowAddDialog(true);
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.currentPrice * p.stock,
    0
  );
  const avgMargin = products.length
    ? products.reduce(
        (sum, p) =>
          sum +
          (p.costPrice > 0
            ? ((p.currentPrice - p.costPrice) / p.currentPrice) * 100
            : 0),
        0
      ) / products.length
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                My Products
              </h1>
            </div>
            <p className="text-muted-foreground">
              Add your products and track competitor prices across e-commerce
              platforms
            </p>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Package className="w-4 h-4" />
              Total Products
            </div>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <IndianRupee className="w-4 h-4" />
              Inventory Value
            </div>
            <p className="text-2xl font-bold">
              ₹{totalInventoryValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Avg Margin
            </div>
            <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
          </div>
          <div className="premium-card rounded-2xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <BarChart3 className="w-4 h-4" />
              Being Tracked
            </div>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="premium-card rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {products.length === 0
                  ? "No products yet"
                  : "No matching products"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {products.length === 0
                  ? "Add your first product to start tracking competitor prices"
                  : "Try a different search term"}
              </p>
              {products.length === 0 && (
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Your Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const margin =
                    product.costPrice > 0
                      ? (
                          ((product.currentPrice - product.costPrice) /
                            product.currentPrice) *
                          100
                        ).toFixed(1)
                      : "—";
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{product.currentPrice.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₹{product.costPrice.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            parseFloat(margin as string) > 20
                              ? "text-green-500"
                              : parseFloat(margin as string) > 10
                              ? "text-yellow-500"
                              : "text-red-500"
                          }
                        >
                          {margin}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            product.stock > 50
                              ? "text-green-500"
                              : product.stock > 10
                              ? "text-yellow-500"
                              : "text-red-500"
                          }
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/products/${product.id}/compare`)
                            }
                            title="Compare Prices"
                          >
                            <TrendingUp className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingProduct(product);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingProduct(null);
            setFormData(defaultForm);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Product Details
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">
                    Product Name *
                  </label>
                  <Input
                    placeholder="e.g. Samsung Galaxy S24 Ultra"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">SKU</label>
                  <Input
                    placeholder="Auto-generated if empty"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-md bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Pricing & Stock
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Your Selling Price (₹) *
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 129999"
                    value={formData.currentPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPrice: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Cost Price (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 95000"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Current Stock
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 50"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Days of Stock
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 30"
                    value={formData.stockDays}
                    onChange={(e) =>
                      setFormData({ ...formData, stockDays: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Competitor Tracking */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Competitor Tracking (Optional)
              </h3>
              <p className="text-xs text-muted-foreground">
                Add product URLs or search keywords to find and compare prices
                on other e-commerce platforms automatically.
              </p>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Amazon Product URL
                </label>
                <Input
                  placeholder="https://www.amazon.in/dp/B0XXXXX..."
                  value={formData.amazonUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, amazonUrl: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Flipkart Product URL
                </label>
                <Input
                  placeholder="https://www.flipkart.com/..."
                  value={formData.flipkartUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, flipkartUrl: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Search Keywords
                </label>
                <Input
                  placeholder="e.g. Samsung Galaxy S24 Ultra 256GB"
                  value={formData.keywords}
                  onChange={(e) =>
                    setFormData({ ...formData, keywords: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll search for this on Amazon, Flipkart, and other platforms
                  to find matching prices
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingProduct ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deletingProduct?.name}
            </span>
            ? This will also remove all price history and alerts for this
            product.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
