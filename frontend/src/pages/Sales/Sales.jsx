import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saleService } from '../../services/saleService';
import { clientService } from '../../services/clientService';
import { productService } from '../../services/productService';
import './Sales.css';
import '../../styles/shared-styles.css';
import LogoImage from '../../img/logo.png';
import SaleImage from '../../img/sales_icon.png';

const Sales = () => {
    const navigate = useNavigate();

    // Estados principales
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado del formulario de venta
    const [saleData, setSaleData] = useState({
        clientId: '',
        items: []
    });

    // Estado para items de venta
    const [currentItem, setCurrentItem] = useState({
        productId: '',
        quantity: 1
    });

    // Estado para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const salesPerPage = 5;

    // Estado para cálculos
    const [totals, setTotals] = useState({
        subtotal: 0,
        iva: 0,
        total: 0
    });

    // Función para obtener detalles del producto
    const getProductDetails = useCallback((productId) => {
        return products.find(p => p.id === parseInt(productId));
    }, [products]);

    // Función para calcular totales con useCallback
    const calculateTotals = useCallback(() => {
        let subtotal = 0;
        let totalIva = 0;

        saleData.items.forEach(item => {
            const product = getProductDetails(item.productId);
            if (product) {
                const itemTotal = product.unitPrice * item.quantity;
                const itemIva = itemTotal * (product.iva / 100);
                subtotal += itemTotal;
                totalIva += itemIva;
            }
        });

        setTotals({
            subtotal,
            iva: totalIva,
            total: subtotal + totalIva
        });
    }, [saleData.items, getProductDetails]);

    // Cargar datos al montar el componente
    useEffect(() => {
        loadInitialData();
    }, []);

    // Calcular totales cuando cambien los items
    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    // Filtrar ventas cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredSales(sales);
        } else {
            const filtered = sales.filter(sale =>
                sale.saleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.total.toString().includes(searchTerm)
            );
            setFilteredSales(filtered);
        }
        setCurrentPage(1); // Resetear a primera página al buscar
    }, [searchTerm, sales]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [clientsData, productsData, salesData] = await Promise.all([
                clientService.getAll(),
                productService.getAll(),
                saleService.getAll()
            ]);

            setClients(clientsData);
            setProducts(productsData);
            setSales(salesData);
            setFilteredSales(salesData);
        } catch (error) {
            setError('Error al cargar los datos iniciales');
            console.error('Error loading initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClientChange = (e) => {
        setSaleData(prev => ({
            ...prev,
            clientId: e.target.value
        }));
    };

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 1 : value
        }));
    };

    const addItem = () => {
        if (!currentItem.productId) {
            setError('Seleccione un producto');
            return;
        }

        const product = getProductDetails(currentItem.productId);
        if (!product) {
            setError('Producto no encontrado');
            return;
        }

        // Verificar si el producto ya está en la lista
        const existingItemIndex = saleData.items.findIndex(
            item => item.productId === parseInt(currentItem.productId)
        );

        if (existingItemIndex >= 0) {
            // Actualizar cantidad si ya existe
            const updatedItems = [...saleData.items];
            updatedItems[existingItemIndex].quantity += currentItem.quantity;
            setSaleData(prev => ({ ...prev, items: updatedItems }));
        } else {
            // Agregar nuevo item
            const newItem = {
                productId: parseInt(currentItem.productId),
                quantity: currentItem.quantity
            };
            setSaleData(prev => ({
                ...prev,
                items: [...prev.items, newItem]
            }));
        }

        // Resetear item actual
        setCurrentItem({
            productId: '',
            quantity: 1
        });
        setError('');
    };

    const removeItem = (index) => {
        const updatedItems = saleData.items.filter((_, i) => i !== index);
        setSaleData(prev => ({ ...prev, items: updatedItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!saleData.clientId) {
            setError('Seleccione un cliente');
            return;
        }

        if (saleData.items.length === 0) {
            setError('Agregue al menos un producto a la venta');
            return;
        }

        try {
            await saleService.create(saleData);
            setSuccess('Venta registrada correctamente');

            // Resetear formulario
            setSaleData({
                clientId: '',
                items: []
            });
            setTotals({
                subtotal: 0,
                iva: 0,
                total: 0
            });

            // Recargar lista de ventas
            loadInitialData();
        } catch (error) {
            setError(error.response?.data?.message || 'Error al registrar la venta');
            console.error('Error creating sale:', error);
        }
    };

    // Paginación
    const indexOfLastSale = currentPage * salesPerPage;
    const indexOfFirstSale = indexOfLastSale - salesPerPage;
    const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
    const totalPages = Math.ceil(filteredSales.length / salesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const formatPrice = (price) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === parseInt(clientId));
        return client ? client.name : '';
    };

    return (
        <div className="module-container">
            <div className="header">
                <div className="header-left">
                    <img src={LogoImage} alt="Logo" className="header-logo" />
                    <h1>MODULO VENTAS</h1>
                </div>
                <div className="header-right">
                    <img src={SaleImage} alt="Ventas" className="header-icon" />
                    <span className="version-menu">VERSION 1.0</span>
                    <button
                        className="button button-regresar-menu"
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
                    {/* Información de la venta */}
                    <div className="sales-purchases-layout-sales">
                        <div className="form-group-sales">
                            <label htmlFor="fecha_venta">FECHA</label>
                            <input
                                type="date"
                                id="fecha_venta"
                                value={new Date().toISOString().split('T')[0]}
                                readOnly
                                className="read-only-input"
                            />
                        </div>

                        <div className="form-group-sales">
                            <label htmlFor="clientId">ID CLIENTE</label>
                            <select
                                id="clientId"
                                name="clientId"
                                value={saleData.clientId}
                                onChange={handleClientChange}
                                className="small-input"
                                required
                            >
                                <option value="">Seleccione cliente</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.identification} - {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group-sales">
                            <label htmlFor="nombre_cliente">NOMBRE CLIENTE</label>
                            <input
                                type="text"
                                id="nombre_cliente"
                                value={getClientName(saleData.clientId)}
                                readOnly
                                className="read-only-input full-width-input"
                            />
                        </div>
                    </div>

                    {/* Agregar productos */}
                    <div className="form-group-sales product-details-group">
                        <label htmlFor="productId">ID PRODUCTO</label>
                        <select
                            id="productId"
                            name="productId"
                            value={currentItem.productId}
                            onChange={handleItemChange}
                            className="small-input"
                        >
                            <option value="">Seleccione producto</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.productCode} - {product.name}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="quantity" className="label-inline-sales">CANTIDAD</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={currentItem.quantity}
                            onChange={handleItemChange}
                            min="1"
                            className="extra-small-input"
                        />
                    </div>

                    <div className="form-group-sales product-detail-actions">
                        <input
                            type="text"
                            value={currentItem.productId ? getProductDetails(currentItem.productId)?.description || '' : ''}
                            placeholder="Detalle del producto"
                            readOnly
                            className="full-width-input"
                        />
                        <button
                            type="button"
                            className="button primary small-button"
                            onClick={addItem}
                        >
                            AGREGAR
                        </button>
                    </div>

                    {/* Tabla de items */}
                    {saleData.items.length > 0 && (
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>PRODUCTO</th>
                                        <th>IVA %</th>
                                        <th>UNIDAD</th>
                                        <th>PRECIO UN.</th>
                                        <th>CANTIDAD</th>
                                        <th>PRECIO TOTAL</th>
                                        <th>ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {saleData.items.map((item, index) => {
                                        const product = getProductDetails(item.productId);
                                        if (!product) return null;

                                        const itemTotal = product.unitPrice * item.quantity;
                                        const itemIva = itemTotal * (product.iva / 100);
                                        const totalWithIva = itemTotal + itemIva;

                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{product.name}</td>
                                                <td>{product.iva}%</td>
                                                <td>{product.unit}</td>
                                                <td>{formatPrice(product.unitPrice)}</td>
                                                <td>{item.quantity}</td>
                                                <td>{formatPrice(totalWithIva)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="button danger small-button"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        QUITAR
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Totales */}
                    <div className="price-iva-total-sales">
                        <span>SUBTOTAL: <input type="text" value={formatPrice(totals.subtotal)} readOnly className="read-only-total-input" /></span>
                        <span>IVA: <input type="text" value={formatPrice(totals.iva)} readOnly className="read-only-total-input" /></span>
                        <span className="total-amount-sales">TOTAL: <input type="text" value={formatPrice(totals.total)} readOnly className="read-only-total-input" /></span>
                    </div>

                    {/* Botones de acción */}
                    <div className="bottom-actions-row-sales">
                        <div className="button-group-sales">
                            <button type="submit" className="button primary">
                                VENDER
                            </button>
                            <button
                                type="button"
                                className="button secondary"
                                onClick={() => {
                                    setSaleData({ clientId: '', items: [] });
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                LIMPIAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Historial de Ventas - ACTUALIZADO CON BÚSQUEDA Y PAGINACIÓN */}
            <div className="sales-history">
                <div className="sales-list-header">
                    <h2>HISTORIAL DE VENTAS</h2>
                    <div className="search-container-sales">
                        <input
                            type="text"
                            placeholder="Buscar por código, cliente o total..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input-sales"
                        />
                        <div className="search-results-info-sales">
                            {filteredSales.length} de {sales.length} ventas encontradas
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Cargando ventas...</div>
                ) : (
                    <>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th>FECHA</th>
                                        <th>CLIENTE</th>
                                        <th>PRODUCTOS</th>
                                        <th>TOTAL</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentSales.map((sale) => (
                                        <tr key={sale.id}>
                                            <td className="sale-code">{sale.saleCode}</td>
                                            <td className="sale-date">{new Date(sale.date).toLocaleDateString()}</td>
                                            <td className="sale-client">{sale.client?.name}</td>
                                            <td className="sale-products">
                                                <span className="products-badge">
                                                    {sale.items?.length || 0} productos
                                                </span>
                                            </td>
                                            <td className="sale-total">{formatPrice(sale.total)}</td>
                                            <td className="actions-sales">
                                                <button
                                                    className="button small-button danger"
                                                    onClick={() => {
                                                        if (window.confirm('¿Está seguro de eliminar esta venta?')) {
                                                            saleService.delete(sale.id)
                                                                .then(() => loadInitialData())
                                                                .catch(error => setError('Error al eliminar la venta'));
                                                        }
                                                    }}
                                                >
                                                    ELIMINAR
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredSales.length === 0 && (
                                <div className="no-data">
                                    {searchTerm ? 'No se encontraron ventas que coincidan con la búsqueda' : 'No hay ventas registradas'}
                                </div>
                            )}
                        </div>

                        {/* Paginación - NUEVA IMPLEMENTACIÓN */}
                        {filteredSales.length > salesPerPage && (
                            <div className="pagination-sales">
                                <button
                                    className="pagination-button-sales"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    ‹ Anterior
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`pagination-button-sales ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    className="pagination-button-sales"
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

export default Sales;