import React from "react"
import { cn } from "../../utils"

type SelectPropsTypes = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, SelectPropsTypes>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    className
                )}
                {...props}
            >
                {children}
            </select>
        )
    }
)
