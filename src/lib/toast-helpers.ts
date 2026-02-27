import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export const toastVariants = {
  success: {
    icon: CheckCircle,
    className: "success-pulse",
  },
  error: {
    icon: XCircle,
    className: "error-pulse animate-shake",
  },
  warning: {
    icon: AlertCircle,
    className: "",
  },
  info: {
    icon: Info,
    className: "",
  },
};

export function showSuccessToast(toast: any, title: string, description?: string) {
  toast({
    title,
    description,
    className: "success-pulse",
  });
}

export function showErrorToast(toast: any, title: string, description?: string) {
  toast({
    title,
    description,
    variant: "destructive",
    className: "error-pulse animate-shake",
  });
}

export function showLoadingToast(toast: any, title: string, description?: string) {
  return toast({
    title,
    description,
    duration: Infinity, // Keep showing until dismissed
  });
}
