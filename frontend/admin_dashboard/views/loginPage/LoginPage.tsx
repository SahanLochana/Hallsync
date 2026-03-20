"use client";

import React from "react";
import Button from "../components/Button";
import InputField from "../components/InputField";

const LoginPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans">
            {/* Header */}
            <header className="p-4 md:px-12 flex justify-between items-center w-full">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#1e3a8a] rounded-lg flex items-center justify-center text-white">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m16 6 4 14" />
                            <path d="M12 6v14" />
                            <path d="M8 8v12" />
                            <path d="M4 4v16" />
                        </svg>
                    </div>
                    <span className="font-bold text-xl text-gray-800">HallSync</span>
                </div>
                <button className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 border rounded-full hover:bg-gray-50 transition-colors">
                    Help Center
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl shadow-blue-50/50 p-8 md:p-12 text-center border border-gray-100">
                        {/* University Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f0f4ff] rounded-2xl mb-6">
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#1e3a8a"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m2 9 10-5 10 5-10 5Z" />
                                <path d="M7 21v-7" />
                                <path d="M17 21v-7" />
                                <path d="M2 14h20v7H2Z" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
                        <p className="text-gray-500 mb-10 text-sm leading-relaxed">
                            Faculty Lecture Hall Management and Smart Scheduling System
                        </p>

                        {/* Login Form */}
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <InputField
                                label="University Email"
                                placeholder="admin@university.edu"
                                type="email"
                                icon={
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                }
                            />
                            <InputField
                                label="Password"
                                placeholder="********"
                                type="password"
                                icon={
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                            />

                            <div className="flex justify-end items-center mb-0 ">
                                <a
                                    href="#"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Forgot password?
                                </a>
                            </div>



                            <Button
                                type="submit"
                                icon={
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                }
                            >
                                Sign In to Dashboard
                            </Button>
                        </form>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-6 md:px-12 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">
                        © 2025 HallSync. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
                        <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</a>
                        <a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;
