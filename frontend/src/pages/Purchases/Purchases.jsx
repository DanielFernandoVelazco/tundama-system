import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { providerService } from '../../services/providerService';
import { productService } from '../../services/productService';
import './Purchases.css';
import LogoImage from '../../img/logo.png';
import CustomerImage from '../../img/customer_icon.png';

const Purchases = () => {
    const navigate = useNavigate();

    // Estados principales
    const [providers, setProviders] = useState([]);
    const [products, setProducts] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado del formulario de compra
    const [purchaseData, setPurchaseData] = useState({
        providerId: '',
        items: []
    });

    // Estado para items de compra
    const [currentItem, setCurrentItem] = useState({
        productId: '',
        quantity: 1,
        unitPrice: '',
        iva: '19'
    });

    // Estado para cálculos
    const [totals, setTotals] = useState({
        subtotal: 0,
        iva: 0,
        total: 0
    });

    // Cargar datos al montar el componente
    useEffect(() => {
        loadInitialData();
    }, []);

    // Función para obtener detalles del producto
    const getProductDetails = useCallback((productId) => {
        return products.find(p => p.id === parseInt(productId));
    }, [products]);

    // Función para calcular totales con useCallback
    const calculateTotals = useCallback(() => {
        let subtotal = 0;
        let totalIva = 0;

        purchaseData.items.forEach(item => {
            const itemTotal = parseFloat(item.unitPrice) * item.quantity;
            const itemIva = itemTotal * (parseFloat(item.iva) / 100);
            subtotal += itemTotal;
            totalIva += itemIva;
        });

        setTotals({
            subtotal,
            iva: totalIva,
            total: subtotal + totalIva
        });
    }, [purchaseData.items]);

    // Calcular totales cuando cambien los items
    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [providersData, productsData, purchasesData] = await Promise.all([
                providerService.getAll(),
                productService.getAll(),
                purchaseService.getAll()
            ]);

            setProviders(providersData);
            setProducts(productsData);
            setPurchases(purchasesData);
        } catch (error) {
            setError('Error al cargar los datos iniciales');
            console.error('Error loading initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProviderChange = (e) => {
        setPurchaseData(prev => ({
            ...prev,
            providerId: e.target.value
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
        if (!currentItem.productId || !currentItem.unitPrice) {
            setError('Complete todos los campos del producto');
            return;
        }

        const product = getProductDetails(currentItem.productId);
        if (!product) {
            setError('Producto no encontrado');
            return;
        }

        // Verificar si el producto ya está en la lista
        const existingItemIndex = purchaseData.items.findIndex(
            item => item.productId === parseInt(currentItem.productId)
        );

        if (existingItemIndex >= 0) {
            // Actualizar cantidad si ya existe
            const updatedItems = [...purchaseData.items];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + currentItem.quantity,
                unitPrice: currentItem.unitPrice,
                iva: currentItem.iva
            };
            setPurchaseData(prev => ({ ...prev, items: updatedItems }));
        } else {
            // Agregar nuevo item
            const newItem = {
                productId: parseInt(currentItem.productId),
                quantity: currentItem.quantity,
                unitPrice: parseFloat(currentItem.unitPrice),
                iva: parseFloat(currentItem.iva)
            };
            setPurchaseData(prev => ({
                ...prev,
                items: [...prev.items, newItem]
            }));
        }

        // Resetear item actual
        setCurrentItem({
            productId: '',
            quantity: 1,
            unitPrice: '',
            iva: '19'
        });
        setError('');
    };

    const removeItem = (index) => {
        const updatedItems = purchaseData.items.filter((_, i) => i !== index);
        setPurchaseData(prev => ({ ...prev, items: updatedItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!purchaseData.providerId) {
            setError('Seleccione un proveedor');
            return;
        }

        if (purchaseData.items.length === 0) {
            setError('Agregue al menos un producto a la compra');
            return;
        }

        try {
            await purchaseService.create(purchaseData);
            setSuccess('Compra registrada correctamente');

            // Resetear formulario
            setPurchaseData({
                providerId: '',
                items: []
            });
            setTotals({
                subtotal: 0,
                iva: 0,
                total: 0
            });

            // Recargar lista de compras
            loadInitialData();
        } catch (error) {
            setError(error.response?.data?.message || 'Error al registrar la compra');
            console.error('Error creating purchase:', error);
        }
    };

    const formatPrice = (price) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };

    const getProviderName = (providerId) => {
        const provider = providers.find(p => p.id === parseInt(providerId));
        return provider ? provider.companyName : '';
    };

    return (
        <div className="container sales-purchases-module-container">
            <div className="header">
                <div className="header-left">
                    <img src={LogoImage} alt="Logo" className="header-logo" />
                    <h1>CARLOS MODULO COMPRAS</h1>
                </div>
                <div className="header-right">
                    <img src={CustomerImage} alt="Compras" className="header-icon" />
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
                    {/* Información de la compra */}
                    <div className="form-group">
                        <label htmlFor="id_compra">ID_CO</label>
                        <input
                            type="text"
                            id="id_compra"
                            value="NTCO-2023-ABR-0149"
                            readOnly
                            className="read-only-input small-input"
                        />
                        <span className="info-text">(Código Compras)</span>
                    </div>

                    <div className="sales-purchases-layout">
                        <div className="form-group">
                            <label htmlFor="id_comprador">ID COMPRADOR</label>
                            <input
                                type="text"
                                id="id_comprador"
                                value="EC-057"
                                readOnly
                                className="read-only-input small-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="providerId"># NIT VENDEDOR</label>
                            <select
                                id="providerId"
                                name="providerId"
                                value={purchaseData.providerId}
                                onChange={handleProviderChange}
                                className="small-input"
                                required
                            >
                                <option value="">Seleccione proveedor</option>
                                {providers.map(provider => (
                                    <option key={provider.id} value={provider.id}>
                                        {provider.identification} - {provider.companyName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="button-row">
                            <button type="button" className="button primary small-button">
                                NUEVO
                            </button>
                            <button type="button" className="button primary small-button">
                                REGISTRAR
                            </button>
                        </div>

                        <div className="form-group full-width">
                            <input
                                type="text"
                                id="nombre_proveedor_compra"
                                value={getProviderName(purchaseData.providerId)}
                                placeholder="Nombre del Proveedor"
                                readOnly
                                className="full-width-input"
                            />
                        </div>
                    </div>

                    {/* Agregar productos */}
                    <div className="form-group product-details-group">
                        <label htmlFor="productId">NOMBRE PRODUCTO</label>
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
                            className="small-input"
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

                        <div className="price-inputs">
                            <label>PRECIO UNITARIO</label>
                            <input
                                type="number"
                                name="unitPrice"
                                value={currentItem.unitPrice}
                                onChange={handleItemChange}
                                step="0.01"
                                min="0"
                                className="extra-small-input"
                                placeholder="0.00"
                            />

                            <label>IVA %</label>
                            <select
                                name="iva"
                                value={currentItem.iva}
                                onChange={handleItemChange}
                                className="extra-small-input"
                            >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="19">19%</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            className="button primary small-button"
                            onClick={addItem}
                        >
                            REGISTRAR
                        </button>
                    </div>

                    {/* Tabla de items */}
                    {purchaseData.items.length > 0 && (
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>NOMBRE</th>
                                        <th>IVA</th>
                                        <th>UNIDAD</th>
                                        <th>PRECIO UN.</th>
                                        <th>CANTIDAD</th>
                                        <th>PRECIO TOTAL</th>
                                        <th>ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchaseData.items.map((item, index) => {
                                        const product = getProductDetails(item.productId);
                                        if (!product) return null;

                                        const itemTotal = item.unitPrice * item.quantity;
                                        const itemIva = itemTotal * (item.iva / 100);
                                        const totalWithIva = itemTotal + itemIva;

                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{product.name}</td>
                                                <td>{item.iva}%</td>
                                                <td>{product.unit}</td>
                                                <td>{formatPrice(item.unitPrice)}</td>
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
                                COMPRAR
                            </button>
                            <button
                                type="button"
                                className="button secondary"
                                onClick={() => {
                                    setPurchaseData({ providerId: '', items: [] });
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                LIMPIAR
                            </button>
                        </div>

                        <div className="totals-summary">
                            <div>SUB TOTAL <span>$ <input type="text" value={formatPrice(totals.subtotal)} readOnly className="read-only-total-input" /></span></div>
                            <div>IVA <span>$ <input type="text" value={formatPrice(totals.iva)} readOnly className="read-only-total-input" /></span></div>
                            <div className="total-amount">TOTAL <span>$ <input type="text" value={formatPrice(totals.total)} readOnly className="read-only-total-input" /></span></div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Historial de Compras */}
            <div className="purchases-history">
                <h2>HISTORIAL DE COMPRAS</h2>
                {loading ? (
                    <div className="loading">Cargando compras...</div>
                ) : (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>CÓDIGO</th>
                                    <th>PROVEEDOR</th>
                                    <th>PRODUCTOS</th>
                                    <th>TOTAL</th>
                                    <th>FECHA</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id}>
                                        <td>{purchase.purchaseCode}</td>
                                        <td>{purchase.provider?.companyName}</td>
                                        <td>{purchase.items?.length || 0} productos</td>
                                        <td>{formatPrice(purchase.total)}</td>
                                        <td>{new Date(purchase.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className="button small-button danger"
                                                onClick={() => {
                                                    if (window.confirm('¿Está seguro de eliminar esta compra?')) {
                                                        purchaseService.delete(purchase.id)
                                                            .then(() => loadInitialData())
                                                            .catch(error => setError('Error al eliminar la compra'));
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
                        {purchases.length === 0 && (
                            <div className="no-data">No hay compras registradas</div>
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

export default Purchases;