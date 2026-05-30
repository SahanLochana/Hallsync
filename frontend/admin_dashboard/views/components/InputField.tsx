"use client";

import React from "react";
import * as Icons from "lucide-react";

const InputField = ({
    label,
    icon,
    name,
    placeholder,
    type = "text",
    error,
    ...props
}: {
    label: string,
    icon?: keyof typeof Icons | React.ReactNode,
    name: string,
    placeholder?: string,
    type?: string,
    error?: string,
    [key: string]: any
}) => {
    const IconComponent = typeof icon === "string" ? (Icons as any)[icon] : null;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="text-left text-sm font-medium text-gray-700">{label}</label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600">
                        {IconComponent ? <IconComponent size={18} /> : icon}
                    </div>
                )}
                <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className={`w-full ${icon ? "pl-10" : "px-4"} pr-4 py-2.5 rounded-lg border bg-white text-gray-900 
                        transition-all outline-none
                        ${error ? "border-red-500" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50"}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default InputField;


