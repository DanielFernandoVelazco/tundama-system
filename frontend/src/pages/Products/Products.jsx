import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import './Products.css';
import '../../styles/shared-styles.css';
import LogoImage from '../../img/logo.png';
import SalesImage from '../../img/sales_icon.png';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        unitPrice: '',
        iva: '19',
        unit: 'Und',
        description: ''
    });

    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 3;

    // Cargar productos al montar el componente
    useEffect(() => {
        loadProducts();
    }, []);

    // Filtrar productos cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.unit.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
        setCurrentPage(1); // Resetear a primera página al buscar
    }, [searchTerm, products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            setError('Error al cargar los productos');
            console.error('Error loading products:', error);
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
            unitPrice: '',
            iva: '19',
            unit: 'Und',
            description: ''
        });
        setEditingId(null);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validar datos
        if (!formData.name || !formData.unitPrice || !formData.iva) {
            setError('Todos los campos obligatorios deben ser llenados');
            return;
        }

        try {
            const productData = {
                ...formData,
                unitPrice: parseFloat(formData.unitPrice),
                iva: parseFloat(formData.iva)
            };

            if (editingId) {
                // Actualizar producto existente
                await productService.update(editingId, productData);
                setSuccess('Producto actualizado correctamente');
            } else {
                // Crear nuevo producto
                await productService.create(productData);
                setSuccess('Producto registrado correctamente');
            }

            resetForm();
            loadProducts(); // Recargar la lista
        } catch (error) {
            setError(error.response?.data?.message || 'Error al guardar el producto');
            console.error('Error saving product:', error);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            unitPrice: product.unitPrice.toString(),
            iva: product.iva.toString(),
            unit: product.unit,
            description: product.description || ''
        });
        setEditingId(product.id);
        setError('');
        setSuccess('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
            try {
                await productService.delete(id);
                setSuccess('Producto eliminado correctamente');
                loadProducts(); // Recargar la lista
            } catch (error) {
                setError('Error al eliminar el producto');
                console.error('Error deleting product:', error);
            }
        }
    };

    // Función segura para formatear precios
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return `$${price.toFixed(2)}`;
        }
        if (typeof price === 'string') {
            return `$${parseFloat(price).toFixed(2)}`;
        }
        return '$0.00';
    };

    // Paginación
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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
                    <h1>MODULO PRODUCTOS</h1>
                </div>
                <div className="header-right">
                    <img src={SalesImage} alt="Productos" className="header-icon" />
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
                    <div className="form-group-products">
                        <label htmlFor="name">NOMBRE PRODUCTO</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group-products">
                        <label htmlFor="unitPrice">PRECIO UNITARIO</label>
                        <input
                            type="number"
                            id="unitPrice"
                            name="unitPrice"
                            value={formData.unitPrice}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            required
                            className="small-input"
                        />
                    </div>

                    <div className="form-group-products">
                        <label htmlFor="iva">IVA %</label>
                        <select
                            id="iva"
                            name="iva"
                            value={formData.iva}
                            onChange={handleInputChange}
                            className="small-input"
                            required
                        >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="19">19%</option>
                        </select>
                    </div>

                    <div className="form-group-products">
                        <label htmlFor="unit">UNIDAD</label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleInputChange}
                            className="small-input"
                            required
                        >
                            <option value="Und">Und</option>
                            <option value="Kg">Kg</option>
                            <option value="Lt">Lt</option>
                            <option value="M">M</option>
                            <option value="M2">M²</option>
                            <option value="M3">M³</option>
                        </select>
                    </div>

                    <div className="form-group-products full-width-textarea-products">
                        <label htmlFor="description">DESCRIPCIÓN</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Descripción del producto..."
                        />
                    </div>

                    <div className="button-group-products">
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

            {/* Lista de Productos Mejorada */}
            <div className="products-list">
                <div className="products-list-header">
                    <h2>INVENTARIO DE PRODUCTOS</h2>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código, descripción o unidad..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        <div className="search-results-info">
                            {filteredProducts.length} de {products.length} productos encontrados
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Cargando productos...</div>
                ) : (
                    <>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th>PRODUCTO</th>
                                        <th>PRECIO UN.</th>
                                        <th>IVA</th>
                                        <th>UNIDAD</th>
                                        <th>DESCRIPCIÓN</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="product-code">{product.productCode}</td>
                                            <td className="product-name">{product.name}</td>
                                            <td className="product-price">{formatPrice(product.unitPrice)}</td>
                                            <td className="product-iva">{product.iva}%</td>
                                            <td className="product-unit">
                                                <span className={`unit-badge ${product.unit.toLowerCase()}`}>
                                                    {product.unit}
                                                </span>
                                            </td>
                                            <td>{product.description || '-'}</td>
                                            <td className="actions">
                                                <button
                                                    className="button small-button secondary"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    EDITAR
                                                </button>
                                                <button
                                                    className="button small-button danger"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    ELIMINAR
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProducts.length === 0 && (
                                <div className="no-data">
                                    {searchTerm ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos registrados'}
                                </div>
                            )}
                        </div>

                        {/* Paginación */}
                        {filteredProducts.length > productsPerPage && (
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

export default Products;