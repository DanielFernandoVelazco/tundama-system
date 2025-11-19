import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import './Providers.css';
import '../../styles/shared-styles.css';
import LogoImage from '../../img/logo.png';
import PurchasIcon from '../../img/purchases_icon.png';

const Providers = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado del formulario
    const [formData, setFormData] = useState({
        companyName: '',
        identification: '',
        address: '',
        phone: '',
        notes: ''
    });

    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const providersPerPage = 3;

    // Cargar proveedores al montar el componente
    useEffect(() => {
        loadProviders();
    }, []);

    // Filtrar proveedores cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProviders(providers);
        } else {
            const filtered = providers.filter(provider =>
                provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                provider.identification.includes(searchTerm) ||
                provider.providerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                provider.phone.includes(searchTerm)
            );
            setFilteredProviders(filtered);
        }
        setCurrentPage(1); // Resetear a primera página al buscar
    }, [searchTerm, providers]);

    const loadProviders = async () => {
        try {
            setLoading(true);
            const data = await providerService.getAll();
            setProviders(data);
            setFilteredProviders(data);
        } catch (error) {
            setError('Error al cargar los proveedores');
            console.error('Error loading providers:', error);
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
            companyName: '',
            identification: '',
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
                // Actualizar proveedor existente
                await providerService.update(editingId, formData);
                setSuccess('Proveedor actualizado correctamente');
            } else {
                // Crear nuevo proveedor
                await providerService.create(formData);
                setSuccess('Proveedor registrado correctamente');
            }

            resetForm();
            loadProviders(); // Recargar la lista
        } catch (error) {
            setError(error.response?.data?.message || 'Error al guardar el proveedor');
            console.error('Error saving provider:', error);
        }
    };

    const handleEdit = (provider) => {
        setFormData({
            companyName: provider.companyName,
            identification: provider.identification,
            address: provider.address,
            phone: provider.phone,
            notes: provider.notes || ''
        });
        setEditingId(provider.id);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este proveedor?')) {
            try {
                await providerService.delete(id);
                setSuccess('Proveedor eliminado correctamente');
                loadProviders(); // Recargar la lista
            } catch (error) {
                setError('Error al eliminar el proveedor');
                console.error('Error deleting provider:', error);
            }
        }
    };

    // Paginación
    const indexOfLastProvider = currentPage * providersPerPage;
    const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
    const currentProviders = filteredProviders.slice(indexOfFirstProvider, indexOfLastProvider);
    const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

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
                    <h1>MODULO PROVEEDOR</h1>
                </div>
                <div className="header-right">
                    <img src={PurchasIcon} alt="Proveedor" className="header-icon" />
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
                    <div className="form-group-providers">
                        <label htmlFor="companyName">NOMBRE EMPRESA</label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group-providers identification-group">
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
                            <div className="nit-badge">
                                NIT
                            </div>
                        </div>
                    </div>

                    <div className="form-group-providers">
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

                    <div className="form-group-providers">
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

                    <div className="form-group-providers full-width-textarea-providers">
                        <label htmlFor="notes">NOTAS</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows="4"
                        />
                    </div>

                    <div className="button-group-providers">
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

            {/* Lista de Proveedores Mejorada */}
            <div className="providers-list">
                <div className="providers-list-header">
                    <h2>LISTA DE PROVEEDORES</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por empresa, identificación, código o teléfono..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        <div className="search-results-info">
                            {filteredProviders.length} de {providers.length} proveedores encontrados
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Cargando proveedores...</div>
                ) : (
                    <>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th>EMPRESA</th>
                                        <th>NIT</th>
                                        <th>DIRECCIÓN</th>
                                        <th>TELÉFONO</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentProviders.map((provider) => (
                                        <tr key={provider.id}>
                                            <td className="provider-code">{provider.providerCode}</td>
                                            <td className="provider-company">{provider.companyName}</td>
                                            <td className="provider-identification">{provider.identification}</td>
                                            <td>{provider.address}</td>
                                            <td className="provider-phone">{provider.phone}</td>
                                            <td className="actions">
                                                <button
                                                    className="button small-button secondary"
                                                    onClick={() => handleEdit(provider)}
                                                >
                                                    EDITAR
                                                </button>
                                                <button
                                                    className="button small-button danger"
                                                    onClick={() => handleDelete(provider.id)}
                                                >
                                                    ELIMINAR
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProviders.length === 0 && (
                                <div className="no-data">
                                    {searchTerm ? 'No se encontraron proveedores que coincidan con la búsqueda' : 'No hay proveedores registrados'}
                                </div>
                            )}
                        </div>

                        {/* Paginación */}
                        {filteredProviders.length > providersPerPage && (
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

            <div className="footer-info">
                <p>NEGOCIO TUNDAMA LTDA</p>
                <p>VERSION 1.0</p>
            </div>
        </div>
    );
};

export default Providers;