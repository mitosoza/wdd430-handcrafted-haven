/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';

export default function ProductSearch({ products }: { products: any[] }) {
  const [query, setQuery] = useState('');

  const filtered = products.filter((p) => {
    const name = p.product_name ?? p.name ?? '';
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div>
      {/* Search box */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div className="text-gray-600">No products match your search.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <div key={p.product_id ?? p.id} className="p-4 border rounded-lg shadow">
              <h2 className="font-semibold">{p.product_name ?? p.name}</h2>
              <p className="text-sm text-gray-600">{p.product_description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}