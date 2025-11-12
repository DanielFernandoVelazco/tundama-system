import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import './Clients.css';

const Clients = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        identification: '',
        identificationType: 'NIT',
        address: '',
        phone: '',
        notes: ''
    });

    const [editingId, setEditingId] = useState(null);

    // Cargar clientes al montar el componente
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            setError('Error al cargar los clientes');
            console.error('Error loading clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            identification: '',
            identificationType: 'NIT',
            address: '',
            phone: '',
            notes: ''
        });
        setEditingId(null);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingId) {
                // Actualizar cliente existente
                await clientService.update(editingId, formData);
                setSuccess('Cliente actualizado correctamente');
            } else {
                // Crear nuevo cliente
                await clientService.create(formData);
                setSuccess('Cliente registrado correctamente');
            }

            resetForm();
            loadClients(); // Recargar la lista
        } catch (error) {
            setError(error.response?.data?.message || 'Error al guardar el cliente');
            console.error('Error saving client:', error);
        }
    };

    const handleEdit = (client) => {
        setFormData({
            name: client.name,
            identification: client.identification,
            identificationType: client.identificationType,
            address: client.address,
            phone: client.phone,
            notes: client.notes || ''
        });
        setEditingId(client.id);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
            try {
                await clientService.delete(id);
                setSuccess('Cliente eliminado correctamente');
                loadClients(); // Recargar la lista
            } catch (error) {
                setError('Error al eliminar el cliente');
                console.error('Error deleting client:', error);
            }
        }
    };

    return (
        <div className="container client-module-container">
            <div className="header">
                <div className="header-left">
                    <img src="/img/logo.png" alt="Logo" className="header-logo" />
                    <h1>CARLOS MODULO CLIENTE</h1>
                </div>
                <div className="header-right">
                    <img src="/img/customer_icon.png" alt="Cliente" className="header-icon" />
                    <span className="version">VERSION 1.0</span>
                    <button
                        className="button button-regresar"
                        onClick={() => navigate('/menu')}
                    >
                        REGRESAR
                    </button>
                </div>
            </div>

            {/* Mensajes de éxito y error */}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-area">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">NOMBRE</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group type-selector">
                        <label htmlFor="identification"># IDENTIFICACIÓN</label>
                        <input
                            type="text"
                            id="identification"
                            name="identification"
                            value={formData.identification}
                            onChange={handleInputChange}
                            required
                            className="medium-input"
                        />
                        <div className="radio-group">
                            <input
                                type="radio"
                                id="nit"
                                name="identificationType"
                                value="NIT"
                                checked={formData.identificationType === 'NIT'}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="nit">NIT</label>
                            <input
                                type="radio"
                                id="cedula"
                                name="identificationType"
                                value="CEDULA"
                                checked={formData.identificationType === 'CEDULA'}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="cedula">CÉDULA</label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">DIRECCIÓN</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">TELÉFONO</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group full-width-textarea">
                        <label htmlFor="notes">NOTAS</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="button primary">
                            {editingId ? 'ACTUALIZAR' : 'REGISTRAR'}
                        </button>
                        <button type="button" className="button secondary" onClick={resetForm}>
                            {editingId ? 'CANCELAR' : 'LIMPIAR'}
                        </button>
                        {editingId && (
                            <button type="button" className="button danger" onClick={() => handleDelete(editingId)}>
                                ELIMINAR
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Lista de Clientes */}
            <div className="clients-list">
                <h2>LISTA DE CLIENTES</h2>
                {loading ? (
                    <div className="loading">Cargando clientes...</div>
                ) : (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>CÓDIGO</th>
                                    <th>NOMBRE</th>
                                    <th>IDENTIFICACIÓN</th>
                                    <th>TIPO</th>
                                    <th>TELÉFONO</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id}>
                                        <td>{client.clientCode}</td>
                                        <td>{client.name}</td>
                                        <td>{client.identification}</td>
                                        <td>{client.identificationType}</td>
                                        <td>{client.phone}</td>
                                        <td>
                                            <button
                                                className="button small-button secondary"
                                                onClick={() => handleEdit(client)}
                                            >
                                                EDITAR
                                            </button>
                                            <button
                                                className="button small-button danger"
                                                onClick={() => handleDelete(client.id)}
                                            >
                                                ELIMINAR
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {clients.length === 0 && (
                            <div className="no-data">No hay clientes registrados</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;