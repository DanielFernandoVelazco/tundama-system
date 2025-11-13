import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import './Providers.css';

const Providers = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
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

    // Cargar proveedores al montar el componente
    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        try {
            setLoading(true);
            const data = await providerService.getAll();
            setProviders(data);
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

    return (
        <div className="container sales-purchases-module-container">
            <div className="header">
                <div className="header-left">
                    <img src="/img/logo.png" alt="Logo" className="header-logo" />
                    <h1>CARLOS MODULO PROVEEDOR</h1>
                </div>
                <div className="header-right">
                    <img src="/img/delivery_icon.png" alt="Proveedor" className="header-icon" />
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
                            <span className="radio-label">NIT</span>
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

            {/* Lista de Proveedores */}
            <div className="providers-list">
                <h2>LISTA DE PROVEEDORES</h2>
                {loading ? (
                    <div className="loading">Cargando proveedores...</div>
                ) : (
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
                                {providers.map((provider) => (
                                    <tr key={provider.id}>
                                        <td>{provider.providerCode}</td>
                                        <td>{provider.companyName}</td>
                                        <td>{provider.identification}</td>
                                        <td>{provider.address}</td>
                                        <td>{provider.phone}</td>
                                        <td>
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
                        {providers.length === 0 && (
                            <div className="no-data">No hay proveedores registrados</div>
                        )}
                    </div>
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