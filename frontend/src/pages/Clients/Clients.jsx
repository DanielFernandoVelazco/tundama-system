import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../../services/clientService';
import './Clients.css';
import '../../styles/shared-styles.css';
import LogoImage from '../../img/logo.png';
import CustomerIcon from '../../img/customer_icon.png';

const Clients = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 3;

    // Cargar clientes al montar el componente
    useEffect(() => {
        loadClients();
    }, []);

    // Filtrar clientes cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredClients(clients);
        } else {
            const filtered = clients.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.identification.includes(searchTerm) ||
                client.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.includes(searchTerm)
            );
            setFilteredClients(filtered);
        }
        setCurrentPage(1); // Resetear a primera página al buscar
    }, [searchTerm, clients]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await clientService.getAll();
            setClients(data);
            setFilteredClients(data);
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

    // Paginación
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="module-container">
            <div className="header">
                <div className="header-left">
                    <img src={LogoImage} alt="Logo" className="header-logo" />
                    <h1>MODULO CLIENTE</h1>
                </div>
                <div className="header-right">
                    <img src={CustomerIcon} alt="Cliente" className="header-icon" />
                    <span className="version-menu">VERSION 1.0</span>
                    <button
                        className="button"
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
                    <div className="form-group-clients">
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

                    <div className="form-group-clients type-selector">
                        <label htmlFor="identification"># IDENTIFICACIÓN</label>
                        <div className="identification-input-container">
                            <input
                                type="text"
                                id="identification"
                                name="identification"
                                value={formData.identification}
                                onChange={handleInputChange}
                                required
                                className="medium-input"
                            />
                            <div className="segment-buttons">
                                <button
                                    type="button"
                                    className={`segment-button ${formData.identificationType === 'NIT' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, identificationType: 'NIT' }))}
                                >
                                    NIT
                                </button>
                                <button
                                    type="button"
                                    className={`segment-button ${formData.identificationType === 'CEDULA' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, identificationType: 'CEDULA' }))}
                                >
                                    CÉDULA
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-group-clients">
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

                    <div className="form-group-clients">
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

                    <div className="form-group-clients full-width-textarea-clients">
                        <label htmlFor="notes">NOTAS</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className="button-group-clients">
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

            {/* Lista de Clientes Mejorada */}
            <div className="clients-list">
                <div className="clients-list-header">
                    <h2>LISTA DE CLIENTES</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, identificación, código o teléfono..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        <div className="search-results-info">
                            {filteredClients.length} de {clients.length} clientes encontrados
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Cargando clientes...</div>
                ) : (
                    <>
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
                                    {currentClients.map((client) => (
                                        <tr key={client.id}>
                                            <td className="client-code">{client.clientCode}</td>
                                            <td className="client-name">{client.name}</td>
                                            <td className="client-identification">{client.identification}</td>
                                            <td className="client-type">
                                                <span className={`type-badge ${client.identificationType.toLowerCase()}`}>
                                                    {client.identificationType}
                                                </span>
                                            </td>
                                            <td className="client-phone">{client.phone}</td>
                                            <td className="actions">
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
                            {filteredClients.length === 0 && (
                                <div className="no-data">
                                    {searchTerm ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes registrados'}
                                </div>
                            )}
                        </div>

                        {/* Paginación */}
                        {filteredClients.length > clientsPerPage && (
                            <div className="pagination">
                                <button
                                    className="pagination-button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    ‹ Anterior
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    className="pagination-button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Clients;