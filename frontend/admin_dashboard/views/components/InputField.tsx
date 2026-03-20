"use client";

import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
    containerClassName?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    icon,
    error,
    containerClassName = "",
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-2 w-full ${containerClassName}`}>
            <label className="text-sm font-semibold text-gray-700 text-left">
                {label}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={`w-full ${icon ? "pl-10" : "px-4"} pr-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 
            transition-all duration-200 outline-none
            ${error ? "border-red-500 ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
          `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default InputField;
