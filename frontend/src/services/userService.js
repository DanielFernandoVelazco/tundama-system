import api from './api';

export const userService = {
    // Obtener todos los usuarios
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    // Obtener un usuario por ID
    getById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    // Crear un nuevo usuario (SignUp)
    create: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    // Actualizar un usuario
    update: async (id, userData) => {
        const response = await api.patch(`/users/${id}`, userData);
        return response.data;
    },

    // Eliminar un usuario
    delete: async (id) => {
        await api.delete(`/users/${id}`);
    }
};