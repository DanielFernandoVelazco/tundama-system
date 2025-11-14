import api from './api';

export const purchaseService = {
    // Obtener todas las compras
    getAll: async () => {
        const response = await api.get('/purchases');
        return response.data;
    },

    // Obtener una compra por ID
    getById: async (id) => {
        const response = await api.get(`/purchases/${id}`);
        return response.data;
    },

    // Crear una nueva compra
    create: async (purchaseData) => {
        // Asegurarnos de que los IDs sean números
        const formattedData = {
            ...purchaseData,
            providerId: parseInt(purchaseData.providerId),
            items: purchaseData.items.map(item => ({
                ...item,
                productId: parseInt(item.productId),
                unitPrice: parseFloat(item.unitPrice),
                iva: parseFloat(item.iva)
            }))
        };

        const response = await api.post('/purchases', formattedData);
        return response.data;
    },

    // Eliminar una compra
    delete: async (id) => {
        await api.delete(`/purchases/${id}`);
    }
};