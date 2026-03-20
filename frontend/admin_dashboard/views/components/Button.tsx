"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary";
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    icon,
    variant = "primary",
    className = "",
    ...props
}) => {
    const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#1e3a8a] hover:bg-[#1a2b6d] text-white shadow-md",
        secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
            {icon && <span className="flex items-center">{icon}</span>}
        </button>
    );
};

export default Button;
