import api from './api';

export const productService = {
    // Obtener todos los productos activos
    getAll: async () => {
        const response = await api.get('/products');
        // Asegurarnos de que los números sean números
        return response.data.map(product => ({
            ...product,
            unitPrice: parseFloat(product.unitPrice),
            iva: parseFloat(product.iva)
        }));
    },

    // Obtener un producto por ID
    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        const product = response.data;
        return {
            ...product,
            unitPrice: parseFloat(product.unitPrice),
            iva: parseFloat(product.iva)
        };
    },

    // Crear un nuevo producto
    create: async (productData) => {
        const response = await api.post('/products', productData);
        const product = response.data;
        return {
            ...product,
            unitPrice: parseFloat(product.unitPrice),
            iva: parseFloat(product.iva)
        };
    },

    // Actualizar un producto
    update: async (id, productData) => {
        const response = await api.patch(`/products/${id}`, productData);
        const product = response.data;
        return {
            ...product,
            unitPrice: parseFloat(product.unitPrice),
            iva: parseFloat(product.iva)
        };
    },

    // Eliminar un producto (desactivar)
    delete: async (id) => {
        await api.delete(`/products/${id}`);
    }
};