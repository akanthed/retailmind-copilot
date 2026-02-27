// User-friendly error messages with actionable guidance

export const errorMessages = {
  // Network errors
  networkError: {
    title: "Connection Problem",
    description: "Can't reach the server. Check your internet connection and try again.",
  },
  
  // Product errors
  productNotFound: {
    title: "Product Not Found",
    description: "This product doesn't exist. It may have been deleted.",
  },
  productCreateFailed: {
    title: "Couldn't Add Product",
    description: "Please check all fields and try again. Name and price are required.",
  },
  productUpdateFailed: {
    title: "Couldn't Update Product",
    description: "Changes weren't saved. Please try again.",
  },
  
  // Price search errors
  priceSearchFailed: {
    title: "Price Search Failed",
    description: "Couldn't find competitor prices. Try adding product URLs or keywords in product details.",
  },
  noPricesFound: {
    title: "No Prices Found",
    description: "AI couldn't find this product online. Add Amazon/Flipkart URLs or more specific keywords.",
  },
  
  // AI errors
  aiResponseFailed: {
    title: "AI Unavailable",
    description: "AI assistant is temporarily unavailable. Try again in a moment.",
  },
  
  // Recommendation errors
  recommendationsFailed: {
    title: "Couldn't Load Recommendations",
    description: "Unable to get AI recommendations. Refresh the page and try again.",
  },
  
  // Generic errors
  genericError: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again.",
  },
  
  // Validation errors
  missingFields: {
    title: "Missing Information",
    description: "Please fill in all required fields (marked with *).",
  },
  invalidPrice: {
    title: "Invalid Price",
    description: "Price must be a positive number (e.g., 1299.99).",
  },
  invalidStock: {
    title: "Invalid Stock",
    description: "Stock must be a whole number (e.g., 50).",
  },
};

// Helper to get user-friendly error message
export function getUserFriendlyError(error: any): { title: string; description: string } {
  if (!error) return errorMessages.genericError;
  
  const errorString = typeof error === 'string' ? error.toLowerCase() : error.message?.toLowerCase() || '';
  
  // Match error patterns
  if (errorString.includes('network') || errorString.includes('fetch')) {
    return errorMessages.networkError;
  }
  if (errorString.includes('not found')) {
    return errorMessages.productNotFound;
  }
  if (errorString.includes('price')) {
    return errorMessages.priceSearchFailed;
  }
  if (errorString.includes('ai') || errorString.includes('bedrock')) {
    return errorMessages.aiResponseFailed;
  }
  
  return errorMessages.genericError;
}
