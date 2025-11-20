import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { providerService } from '../../services/providerService';
import { productService } from '../../services/productService';
import './Purchases.css';
import '../../styles/shared-styles.css';
import LogoImage from '../../img/logo.png';
import CustomerImage from '../../img/customer_icon.png';

const Purchases = () => {
    const navigate = useNavigate();

    // Estados principales
    const [providers, setProviders] = useState([]);
    const [products, setProducts] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado del formulario de compra
    const [purchaseData, setPurchaseData] = useState({
        providerId: '',
        buyerId: 'EC-057', // ID del comprador fijo
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

    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const purchasesPerPage = 3;

    // Cargar datos al montar el componente
    useEffect(() => {
        loadInitialData();
    }, []);

    // Filtrar compras cuando cambia el término de búsqueda
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPurchases(purchases);
        } else {
            const filtered = purchases.filter(purchase =>
                purchase.purchaseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.provider?.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                purchase.total.toString().includes(searchTerm) ||
                new Date(purchase.createdAt).toLocaleDateString().includes(searchTerm)
            );
            setFilteredPurchases(filtered);
        }
        setCurrentPage(1);
    }, [searchTerm, purchases]);

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
            setFilteredPurchases(purchasesData);
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
                buyerId: 'EC-057',
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

    // Paginación
    const indexOfLastPurchase = currentPage * purchasesPerPage;
    const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
    const currentPurchases = filteredPurchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
    const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);

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
                    <h1>MODULO COMPRAS</h1>
                </div>
                <div className="header-right">
                    <img src={CustomerImage} alt="Compras" className="header-icon" />
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
                    {/* Información de comprador y vendedor */}
                    <div className="buyer-seller-section">
                        <div className="section-title">INFORMACIÓN DE LA COMPRA</div>

                        <div className="buyer-seller-grid">
                            {/* Información del Comprador */}
                            <div className="buyer-info">
                                <h3>COMPRADOR</h3>
                                <div className="form-group-purchases">
                                    <label htmlFor="id_comprador">ID COMPRADOR</label>
                                    <input
                                        type="text"
                                        id="id_comprador"
                                        value={purchaseData.buyerId}
                                        readOnly
                                        className="read-only-input small-input"
                                    />
                                </div>
                                <div className="form-group-purchases">
                                    <label htmlFor="nombre_comprador">NOMBRE COMPRADOR</label>
                                    <input
                                        type="text"
                                        id="nombre_comprador"
                                        value="EMPRESA TUNDAMA LTDA"
                                        readOnly
                                        className="read-only-input"
                                    />
                                </div>
                            </div>

                            {/* Información del Vendedor */}
                            <div className="seller-info">
                                <h3>VENDEDOR</h3>
                                <div className="form-group-purchases">
                                    <label htmlFor="providerId">NIT VENDEDOR</label>
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
                                <div className="form-group-purchases">
                                    <label htmlFor="nombre_proveedor_compra">NOMBRE VENDEDOR</label>
                                    <input
                                        type="text"
                                        id="nombre_proveedor_compra"
                                        value={getProviderName(purchaseData.providerId)}
                                        placeholder="Nombre del Proveedor"
                                        readOnly
                                        className="read-only-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Agregar productos - REORGANIZADO EN FILAS SEPARADAS */}
                    <div className="product-section">
                        <div className="section-title">AGREGAR PRODUCTOS</div>

                        {/* Fila 1: Selección de producto */}
                        <div className="form-group-purchases product-row">
                            <label htmlFor="productId">PRODUCTO</label>
                            <select
                                id="productId"
                                name="productId"
                                value={currentItem.productId}
                                onChange={handleItemChange}
                                className="product-select"
                            >
                                <option value="">Seleccione producto</option>
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.productCode} - {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Fila 2: Detalles del producto */}
                        <div className="form-group-purchases product-row">
                            <label htmlFor="product_description">DETALLE</label>
                            <input
                                type="text"
                                id="product_description"
                                value={currentItem.productId ? getProductDetails(currentItem.productId)?.description || '' : ''}
                                placeholder="Detalle del producto"
                                readOnly
                                className="product-description"
                            />
                        </div>

                        {/* Fila 3: Cantidad */}
                        <div className="form-group-purchases product-row">
                            <label htmlFor="quantity">CANTIDAD</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={currentItem.quantity}
                                onChange={handleItemChange}
                                min="1"
                                className="quantity-input"
                            />
                        </div>

                        {/* Fila 4: Precio Unitario */}
                        <div className="form-group-purchases product-row">
                            <label htmlFor="unitPrice">PRECIO UNITARIO</label>
                            <input
                                type="number"
                                id="unitPrice"
                                name="unitPrice"
                                value={currentItem.unitPrice}
                                onChange={handleItemChange}
                                step="0.01"
                                min="0"
                                className="price-input"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Fila 5: IVA */}
                        <div className="form-group-purchases product-row">
                            <label htmlFor="iva">IVA %</label>
                            <select
                                id="iva"
                                name="iva"
                                value={currentItem.iva}
                                onChange={handleItemChange}
                                className="iva-select"
                            >
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="19">19%</option>
                            </select>
                        </div>

                        {/* Fila 6: Botón Agregar */}
                        <div className="form-group-purchases product-row">
                            <label></label>
                            <button
                                type="button"
                                className="button primary register-button"
                                onClick={addItem}
                            >
                                AGREGAR PRODUCTO
                            </button>
                        </div>
                    </div>

                    {/* Tabla de items agregados */}
                    {purchaseData.items.length > 0 && (
                        <div className="items-table-section">
                            <div className="section-title">PRODUCTOS AGREGADOS</div>
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
                        </div>
                    )}

                    {/* Totales */}
                    {purchaseData.items.length > 0 && (
                        <div className="totals-section">
                            <div className="section-title">TOTALES DE LA COMPRA</div>
                            <div className="price-iva-total-purchases">
                                <span>SUBTOTAL: <input type="text" value={formatPrice(totals.subtotal)} readOnly className="read-only-total-input" /></span>
                                <span>IVA: <input type="text" value={formatPrice(totals.iva)} readOnly className="read-only-total-input" /></span>
                                <span className="total-amount-purchases">TOTAL: <input type="text" value={formatPrice(totals.total)} readOnly className="read-only-total-input" /></span>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="button-group-purchases">
                        <button type="submit" className="button primary large-button">
                            REGISTRAR COMPRA
                        </button>
                        <button
                            type="button"
                            className="button secondary"
                            onClick={() => {
                                setPurchaseData({ providerId: '', buyerId: 'EC-057', items: [] });
                                setError('');
                                setSuccess('');
                            }}
                        >
                            LIMPIAR FORMULARIO
                        </button>
                    </div>
                </form>
            </div>

            {/* Historial de Compras */}
            <div className="purchases-history">
                <div className="purchases-history-header">
                    <h2>HISTORIAL DE COMPRAS</h2>
                    <div className="search-container-purchases">
                        <input
                            type="text"
                            placeholder="Buscar por código, proveedor, total o fecha..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input-purchases"
                        />
                        <div className="search-results-info-purchases">
                            {filteredPurchases.length} de {purchases.length} compras encontradas
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Cargando compras...</div>
                ) : (
                    <>
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
                                    {currentPurchases.map((purchase) => (
                                        <tr key={purchase.id}>
                                            <td className="client-code">{purchase.purchaseCode}</td>
                                            <td className="client-name">{purchase.provider?.companyName}</td>
                                            <td>{purchase.items?.length || 0} productos</td>
                                            <td className="client-identification">{formatPrice(purchase.total)}</td>
                                            <td className="client-phone">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                                            <td className="actions">
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
                            {filteredPurchases.length === 0 && (
                                <div className="no-data">
                                    {searchTerm ? 'No se encontraron compras que coincidan con la búsqueda' : 'No hay compras registradas'}
                                </div>
                            )}
                        </div>

                        {/* Paginación */}
                        {filteredPurchases.length > purchasesPerPage && (
                            <div className="pagination-purchases">
                                <button
                                    className="pagination-button-purchases"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    ‹ Anterior
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`pagination-button-purchases ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    className="pagination-button-purchases"
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

export default Purchases;