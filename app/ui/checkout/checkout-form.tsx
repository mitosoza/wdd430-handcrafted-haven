'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatCurrency } from '@/app/lib/utils';
import ImageWithFallback from '@/app/ui/products/image-with-fallback';
import { createOrder, OrderState } from '@/app/lib/actions';
import { useActionState } from 'react';

interface CartItem {
    productId: string;
    quantity: number;
    productName: string;
    price: string;
    productImage: string;
}

interface Address {
    address_id: string;
    user_id: string;
    street_address_1: string;
    street_address_2?: string;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    first_name?: string;
    last_name?: string;
}

export default function CheckoutForm() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const initialOrderState: OrderState = { message: null, errors: {} };
    const [orderState, formAction] = useActionState(createOrder, initialOrderState);
    const [newAddress, setNewAddress] = useState({
        first_name: '',
        last_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US'
    });

    useEffect(() => {
        const loadData = async () => {
            const savedCart = localStorage.getItem('havenCart');
            if (savedCart) {
                try {
                    setCartItems(JSON.parse(savedCart));
                } catch (error) {
                    console.error('Error parsing cart data:', error);
                }
            }
            try {
                const response = await fetch('/api/addresses');
                if (response.ok) {
                    const data = await response.json();
                    setAddresses(data.addresses || []);

                    // Auto-select default address if available
                    const defaultAddress = data.addresses?.find((addr: Address) => addr.is_default);
                    if (defaultAddress) {
                        setSelectedAddressId(defaultAddress.address_id);
                    }
                } else {
                    console.error('Failed to fetch addresses');
                }
            } catch (error) {
                console.error('Error fetching addresses:', error);
            }

            setIsLoading(false);
        };

        loadData();
    }, []);

    const handleSaveAddress = async () => {
        if (!newAddress.first_name || !newAddress.last_name || !newAddress.address_line_1 ||
            !newAddress.city || !newAddress.state || !newAddress.postal_code) {
            alert('Please fill in all required address fields');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('address_line_1', newAddress.address_line_1);
            formData.append('address_line_2', newAddress.address_line_2 || '');
            formData.append('city', newAddress.city);
            formData.append('state_province', newAddress.state);
            formData.append('postal_code', newAddress.postal_code);
            formData.append('country', newAddress.country);
            formData.append('first_name', newAddress.first_name);
            formData.append('last_name', newAddress.last_name);

            const response = await fetch('/api/addresses', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const addressResponse = await fetch('/api/addresses');
                if (addressResponse.ok) {
                    const data = await addressResponse.json();
                    setAddresses(data.addresses || []);

                    const newAddresses = data.addresses || [];
                    if (newAddresses.length > 0) {
                        const lastAddress = newAddresses[newAddresses.length - 1];
                        setSelectedAddressId(lastAddress.address_id);
                    }
                }

                setShowAddressForm(false);

                setNewAddress({
                    first_name: '',
                    last_name: '',
                    address_line_1: '',
                    address_line_2: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    country: 'US'
                });

                alert('Address saved successfully!');
            } else {
                const errorData = await response.json();
                alert(`Failed to save address: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address. Please try again.');
        }
    };

    const getSubtotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);
    };

    const getTax = () => {
        return getSubtotal() * 0.06;
    };

    const getTotalPrice = () => {
        return getSubtotal() + getTax();
    };

    const handlePlaceOrder = async (formData: FormData) => {
        if (!selectedAddressId || !cardNumber || !expiryDate || !cvv || !cardholderName) {
            alert('Please fill in all required fields');
            return;
        }

        setIsProcessing(true);

        const cartItemsForOrder = cartItems.map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.price,
            seller_id: ''
        }));

        formData.append('total_amount', getTotalPrice().toString());
        formData.append('shipping_address_id', selectedAddressId);
        formData.append('cart_items', JSON.stringify(cartItemsForOrder));

        try {
            await formAction(formData);
            localStorage.removeItem('havenCart');
            setCartItems([]);
            alert('Order placed successfully! Thank you for your purchase.');
            window.location.href = '/cart';
        } catch (error) {
            console.error('Order creation failed:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
                <Link
                    href="/products"
                    className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orderState?.message && (
                <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
                    {orderState.message}
                </div>
            )}

            {orderState?.errors?.general && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
                    {orderState.errors.general.join(', ')}
                </div>
            )}

            <form action={handlePlaceOrder} className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>

                    {!showAddressForm ? (
                        <div className="space-y-4">
                            {addresses.length > 0 ? (
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Address
                                    </label>
                                    <select
                                        id="address"
                                        value={selectedAddressId}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        required
                                    >
                                        <option value="">Select an address</option>
                                        {addresses.map((address) => (
                                            <option key={address.address_id} value={address.address_id}>
                                                {address.first_name && address.last_name ? `${address.first_name} ${address.last_name} - ` : ''}{address.street_address_1}, {address.city}, {address.state_province} {address.postal_code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p className="text-gray-600">No saved addresses found.</p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(true)}
                                    className="rounded-full bg-cyan-200/50 px-4 py-2 text-sm text-gray-900 font-medium hover:bg-cyan-200 transition-colors"
                                >
                                    Create New Address
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {addresses.length === 0 && (
                                <p className="text-gray-600 mb-4">No saved addresses found. Please add a shipping address:</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        value={newAddress.first_name}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, first_name: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        value={newAddress.last_name}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, last_name: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="addressLine1"
                                        value={newAddress.address_line_1}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                                        Apartment, suite, etc. (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="addressLine2"
                                        value={newAddress.address_line_2}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        placeholder="CA"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code *
                                    </label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        value={newAddress.postal_code}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        placeholder="12345"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country *
                                    </label>
                                    <select
                                        id="country"
                                        value={newAddress.country}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                        required
                                    >
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="MX">Mexico</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(false)}
                                    className="flex-1 bg-gray-200 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAddress}
                                    className="flex-1 bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
                                >
                                    Save Address
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                                Cardholder Name
                            </label>
                            <input
                                type="text"
                                id="cardholderName"
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                            </label>
                            <input
                                type="text"
                                id="cardNumber"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                            </label>
                            <input
                                type="text"
                                id="expiryDate"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                CVV
                            </label>
                            <input
                                type="text"
                                id="cvv"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="123"
                                maxLength={3}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-2">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="flex justify-between text-sm">
                                <span>{item.productName} (x{item.quantity})</span>
                                <span>{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between text-sm pt-2 mt-2 border-t">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(getSubtotal())}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax (6%):</span>
                            <span>{formatCurrency(getTax())}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>{formatCurrency(getTotalPrice())}</span>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing Order...' : `Place Order - ${formatCurrency(getTotalPrice())}`}
                </button>
            </form>
        </div>
    );
}