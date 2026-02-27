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
import { SimpleProductForm } from "@/components/forms/SimpleProductForm";
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
  IndianRupee,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient, Product } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { errorMessages, getUserFriendlyError } from "@/lib/errorMessages";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
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
          title: errorMessages.genericError.title,
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      setProducts(result.data?.products || []);
    } catch (error) {
      console.error("Error:", error);
      const friendlyError = getUserFriendlyError(error);
      toast({
        title: friendlyError.title,
        description: friendlyError.description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(productData: any) {
    try {
      let result;
      if (editingProduct) {
        result = await apiClient.updateProduct(editingProduct.id, productData);
      } else {
        result = await apiClient.createProduct(productData);
      }

      if (result.error) {
        const friendlyError = editingProduct 
          ? errorMessages.productUpdateFailed 
          : errorMessages.productCreateFailed;
        toast({
          title: friendlyError.title,
          description: friendlyError.description,
          variant: "destructive"
        });
        throw new Error(result.error);
      }

      toast({
        title: editingProduct ? "Product Updated" : "Product Added",
        description: `${productData.name} has been ${editingProduct ? "updated" : "added"} successfully`,
      });

      setShowAddDialog(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async function handleDeleteProduct() {
    if (!deletingProduct) return;

    try {
      const result = await apiClient.deleteProduct(deletingProduct.id);
      if (result.error) {
        toast({
          title: errorMessages.genericError.title,
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
      const friendlyError = getUserFriendlyError(error);
      toast({
        title: friendlyError.title,
        description: friendlyError.description,
        variant: "destructive",
      });
    }
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setShowAddDialog(true);
  }

  function openAddDialog() {
    setEditingProduct(null);
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

        <div className="flex items-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: "0.12s" }}>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="gap-1"
          >
            <Package className="w-4 h-4" />
            Cards
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            Table
          </Button>
        </div>

        {viewMode === "grid" && filteredProducts.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6 animate-fade-in"
            style={{ animationDelay: "0.14s" }}
          >
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
                <div key={product.id} className="premium-card rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-medium text-foreground">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                      {product.stock > 10 ? "In Stock" : "Low Stock"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-primary/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">Your Price</p>
                      <p className="text-lg font-semibold text-primary">
                        ₹{product.currentPrice.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground">Margin</p>
                      <p className="text-lg font-semibold">{margin}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/products/${product.id}/compare`)}
                    >
                      Compare
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingProduct(product);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === "grid" && filteredProducts.length === 0 && (
          <div className="premium-card rounded-2xl p-12 text-center animate-fade-in" style={{ animationDelay: "0.14s" }}>
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {products.length === 0 ? "No products yet" : "No matching products"}
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
        )}

        {/* Products Table */}
        {viewMode === "table" && (
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
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {editingProduct ? "Update product details" : "Just the basics - we'll handle the rest"}
            </p>
          </DialogHeader>

          <SimpleProductForm
            initialData={editingProduct ? {
              name: editingProduct.name,
              currentPrice: String(editingProduct.currentPrice),
              stock: String(editingProduct.stock),
              costPrice: String(editingProduct.costPrice),
              category: editingProduct.category,
              sku: editingProduct.sku,
              amazonUrl: (editingProduct as any).amazonUrl,
              flipkartUrl: (editingProduct as any).flipkartUrl,
              keywords: (editingProduct as any).keywords,
            } : undefined}
            onSubmit={handleSaveProduct}
            onCancel={() => setShowAddDialog(false)}
            isEditing={!!editingProduct}
          />
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
