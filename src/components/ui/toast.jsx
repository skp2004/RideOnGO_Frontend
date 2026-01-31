import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastContext = createContext(null)

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

const toastVariants = {
    default: "bg-background border",
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    destructive: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
}

const toastIcons = {
    default: null,
    success: CheckCircle,
    destructive: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

function Toast({ id, title, description, variant = "default", onClose }) {
    const Icon = toastIcons[variant]

    return (
        <div
            className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full",
                toastVariants[variant]
            )}
        >
            {Icon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
                {title && <div className="font-semibold text-sm">{title}</div>}
                {description && (
                    <div className="text-sm opacity-90 mt-1">{description}</div>
                )}
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const toast = useCallback(({ title, description, variant = "default", duration = 5000 }) => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, title, description, variant }])

        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, duration)
        }

        return id
    }, [])

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            {/* Toast Container - Fixed to top right */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <Toast key={t.id} {...t} onClose={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}
