import React from 'react'
import { cn } from '../../utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:pointer-events-none',
                    {
                        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500': variant === 'primary',
                        'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus:ring-zinc-500': variant === 'secondary',
                        'bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800': variant === 'ghost',
                        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
                        'h-8 px-3 text-sm': size === 'sm',
                        'h-10 px-4 py-2': size === 'md',
                        'h-12 px-6 text-lg': size === 'lg',
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
