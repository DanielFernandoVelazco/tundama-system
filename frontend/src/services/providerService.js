import api from './api';

export const providerService = {
    // Obtener todos los proveedores
    getAll: async () => {
        const response = await api.get('/providers');
        return response.data;
    },

    // Obtener un proveedor por ID
    getById: async (id) => {
        const response = await api.get(`/providers/${id}`);
        return response.data;
    },

    // Crear un nuevo proveedor
    create: async (providerData) => {
        const response = await api.post('/providers', providerData);
        return response.data;
    },

    // Actualizar un proveedor
    update: async (id, providerData) => {
        const response = await api.patch(`/providers/${id}`, providerData);
        return response.data;
    },

    // Eliminar un proveedor
    delete: async (id) => {
        await api.delete(`/providers/${id}`);
    }
};