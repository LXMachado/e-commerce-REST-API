import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('/products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Products fetched successfully:', data);
                setProducts(data);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    }, []);

    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 flex flex-col items-center">
                        <h2 className="text-lg font-semibold">{product.name}</h2>
                        <p>{product.description}</p>
                        <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-64 object-cover mt-2" />
                        <div className="mt-4">
                            <Link to={`/product/${product.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsPage;