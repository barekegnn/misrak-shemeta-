'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/debug/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Product Diagnostic Page</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p>Total Products: {products.length}</p>
        <p>Harar Products: {products.filter(p => p.shopCity === 'Harar').length}</p>
        <p>Dire Dawa Products: {products.filter(p => p.shopCity === 'Dire Dawa').length}</p>
        <p>Products without shopCity: {products.filter(p => !p.shopCity).length}</p>
      </div>

      <div className="grid gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="border p-4 rounded-lg">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                {product.hasImages ? (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=96&background=random&color=fff&bold=true`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-500">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{index + 1}. {product.name}</h3>
                <p className="text-sm text-gray-600">Shop City: <span className="font-medium">{product.shopCity || 'MISSING'}</span></p>
                <p className="text-sm text-gray-600">Category: {product.category}</p>
                <p className="text-sm text-gray-600">Price: {product.price} ETB</p>
                <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                <p className="text-sm text-gray-600">Has Images: {product.hasImages ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
