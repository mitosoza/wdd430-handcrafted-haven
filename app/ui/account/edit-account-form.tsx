"use client";
import React from "react";
import { useActionState } from "react";
import { updateUserAccount, updateSellerAccount, UserState } from "@/app/lib/actions";
import { lusitana } from "@/app/ui/fonts";

export default function EditAccountForm({ account, role }: {
    account?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        password?: string;
    };
    role?: "user" | "seller";
}) {
    const initialState: UserState = {
        message: null, errors: {}, fieldValues: {
            user_first_name: account?.first_name || "",
            user_last_name: account?.last_name || "",
            user_email: account?.email || "",
        }
    };

    const actionFn = role === "seller" ? updateSellerAccount : updateUserAccount;
    const [state, formAction] = useActionState<UserState, FormData>(actionFn, initialState);

    return (
        <form action={formAction} className="space-y-3 max-w-xl mx-auto">
            <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 ring-gray-300 shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                <h1 className={`${lusitana.className} mb-3 text-2xl text-center font-bold`}>
                    Edit Account
                </h1>
                {state?.message && (
                    <div className={`mb-4 rounded p-3 text-center text-sm font-medium ${state.message.startsWith('Account updated') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {state.message}
                    </div>
                )}
                <div className="w-full">
                    <div>
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="user_first_name"
                        >
                            First Name
                        </label>
                        <input
                            type="text"
                            id="user_first_name"
                            name="user_first_name"
                            defaultValue={state?.fieldValues?.user_first_name || ""}
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500"
                            required
                        />
                        {state?.errors?.user_first_name && (
                            <p className="mt-1 text-xs text-red-600">{state.errors.user_first_name.join(", ")}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="user_last_name"
                        >
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="user_last_name"
                            name="user_last_name"
                            defaultValue={state?.fieldValues?.user_last_name || ""}
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500"
                            required
                        />
                        {state?.errors?.user_last_name && (
                            <p className="mt-1 text-xs text-red-600">{state.errors.user_last_name.join(", ")}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="user_email"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="user_email"
                            name="user_email"
                            defaultValue={state?.fieldValues?.user_email || ""}
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500"
                            required
                        />
                        {state?.errors?.user_email && (
                            <p className="mt-1 text-xs text-red-600">{state.errors.user_email.join(", ")}</p>
                        )}
                    </div>
                    <div className="mt-4">
                        <label
                            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
                            htmlFor="user_password"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="user_password"
                            name="user_password"
                            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500"
                        />
                        {state?.errors?.user_password && (
                            <p className="mt-1 text-xs text-red-600">{state.errors.user_password.join(", ")}</p>
                        )}
                    </div>
                </div>
                <button type="submit" className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 active:bg-blue-700 transition-colors">
                    Save Changes
                </button>
            </div>
        </form>
    );
}