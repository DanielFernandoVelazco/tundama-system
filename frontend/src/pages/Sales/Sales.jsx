import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { saleService } from '../../services/saleService';
import { clientService } from '../../services/clientService';
import { productService } from '../../services/productService';
import './Sales.css';
import LogoImage from '../../img/logo.png';
import SaleImage from '../../img/sales_icon.png';

const Sales = () => {
    const navigate = useNavigate();

    // Estados principales
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
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

    const formatPrice = (price) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };

    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === parseInt(clientId));
        return client ? client.name : '';
    };

    return (
        <div className="container sales-purchases-module-container">
            <div className="header">
                <div className="header-left">
                    <img src={LogoImage} alt="Logo" className="header-logo" />
                    <h1>CARLOS MODULO VENTAS</h1>
                </div>
                <div className="header-right">
                    <img src={SaleImage} alt="Ventas" className="header-icon" />
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
                    {/* Información de la venta */}
                    <div className="form-group">
                        <label htmlFor="id_venta">ID_V</label>
                        <input
                            type="text"
                            id="id_venta"
                            value="NTV-2023-ABR-0074"
                            readOnly
                            className="read-only-input small-input"
                        />
                        <span className="info-text">(Código Ventas)</span>
                    </div>

                    <div className="sales-purchases-layout">
                        <div className="form-group">
                            <label htmlFor="fecha_venta">FECHA</label>
                            <input
                                type="date"
                                id="fecha_venta"
                                value={new Date().toISOString().split('T')[0]}
                                readOnly
                                className="read-only-input"
                            />
                        </div>

                        <div className="form-group">
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

                        <div className="form-group">
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
                    <div className="form-group product-details-group">
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

                        <label htmlFor="quantity" className="label-inline">CANTIDAD</label>
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

                    <div className="form-group product-detail-actions">
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
                    <div className="price-iva-total">
                        <span>SUBTOTAL: <input type="text" value={formatPrice(totals.subtotal)} readOnly className="read-only-total-input" /></span>
                        <span>IVA: <input type="text" value={formatPrice(totals.iva)} readOnly className="read-only-total-input" /></span>
                        <span className="total-amount">TOTAL: <input type="text" value={formatPrice(totals.total)} readOnly className="read-only-total-input" /></span>
                    </div>

                    {/* Botones de acción */}
                    <div className="bottom-actions-row">
                        <div className="button-group">
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

            {/* Historial de Ventas */}
            <div className="sales-history">
                <h2>HISTORIAL DE VENTAS</h2>
                {loading ? (
                    <div className="loading">Cargando ventas...</div>
                ) : (
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
                                {sales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>{sale.saleCode}</td>
                                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                                        <td>{sale.client?.name}</td>
                                        <td>{sale.items?.length || 0} productos</td>
                                        <td>{formatPrice(sale.total)}</td>
                                        <td>
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
                        {sales.length === 0 && (
                            <div className="no-data">No hay ventas registradas</div>
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

export default Sales;