import api from './api';

export const saleService = {
    // Obtener todas las ventas
    getAll: async () => {
        const response = await api.get('/sales');
        return response.data;
    },

    // Obtener una venta por ID
    getById: async (id) => {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    },

    // Crear una nueva venta
    create: async (saleData) => {
        // Asegurarnos de que clientId sea un número
        const formattedData = {
            ...saleData,
            clientId: parseInt(saleData.clientId),
            items: saleData.items.map(item => ({
                ...item,
                productId: parseInt(item.productId)
            }))
        };

        const response = await api.post('/sales', formattedData);
        return response.data;
    },

    // Eliminar una venta
    delete: async (id) => {
        await api.delete(`/sales/${id}`);
    }
};