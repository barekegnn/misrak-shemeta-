'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    console.log('Diagnostic page loaded, fetching products...');
    
    fetch('/api/debug/products')
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Data received:', data);
        setDebugInfo(data);
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <p>Fetching products from database...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-red-500">{error}</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Product Diagnostic Page</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p className="text-lg">Total Products: <strong>{products.length}</strong></p>
        <p className="text-lg">Harar Products: <strong>{products.filter(p => p.shopCity === 'HARAR').length}</strong></p>
        <p className="text-lg">Dire Dawa Products: <strong>{products.filter(p => p.shopCity === 'DIRE_DAWA').length}</strong></p>
        <p className="text-lg">Products without shopCity: <strong className="text-red-600">{products.filter(p => !p.shopCity).length}</strong></p>
      </div>

      <h2 className="text-2xl font-bold mb-4">All Products ({products.length})</h2>

      <div className="grid gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                {product.hasImages ? (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=96&background=random&color=fff&bold=true`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load for:', product.name);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-500">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{index + 1}. {product.name}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="text-gray-600">Shop City:</span>{' '}
                    <span className={`font-medium ${product.shopCity ? 'text-green-600' : 'text-red-600'}`}>
                      {product.shopCity || 'MISSING ❌'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">Category: <span className="font-medium">{product.category}</span></p>
                  <p className="text-sm text-gray-600">Price: <span className="font-medium">{product.price} ETB</span></p>
                  <p className="text-sm text-gray-600">Stock: <span className="font-medium">{product.stock}</span></p>
                  <p className="text-sm text-gray-600">Has Images: <span className="font-medium">{product.hasImages ? '✅ Yes' : '❌ No'}</span></p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No products found in database</p>
        </div>
      )}
    </div>
  );
}
