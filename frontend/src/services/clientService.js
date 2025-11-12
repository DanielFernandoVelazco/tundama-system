import api from './api';

export const clientService = {
    // Obtener todos los clientes
    getAll: async () => {
        const response = await api.get('/clients');
        return response.data;
    },

    // Obtener un cliente por ID
    getById: async (id) => {
        const response = await api.get(`/clients/${id}`);
        return response.data;
    },

    // Crear un nuevo cliente
    create: async (clientData) => {
        const response = await api.post('/clients', clientData);
        return response.data;
    },

    // Actualizar un cliente
    update: async (id, clientData) => {
        const response = await api.patch(`/clients/${id}`, clientData);
        return response.data;
    },

    // Eliminar un cliente
    delete: async (id) => {
        await api.delete(`/clients/${id}`);
    }
};