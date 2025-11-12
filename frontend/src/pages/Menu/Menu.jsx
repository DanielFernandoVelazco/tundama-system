import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Menu.css';
import LogoImage from '../../img/logo.png';
import UserIcon from '../../img/user_icon.png';
import UserFigure from '../../img/user_figure.png';

const Menu = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuOptions = [
        { path: '/clients', label: 'REGISTRAR CLIENTE' },
        { path: '/providers', label: 'REGISTRAR PROVEEDOR' },
        { path: '/sales', label: 'REGISTRAR VENTAS' },
        { path: '/purchases', label: 'REGISTRAR COMPRAS' },
    ];

    return (
        <div className="menu-container">
            <div className="header">
                <div className="header-left">
                    <img src={LogoImage} alt="Logo" className="header-logo" />
                    <h1>BIENVENIDO - CARLOS ELIGE UNA OPCION</h1>
                </div>
                <div className="header-right">
                    <img src={UserIcon} alt="Usuario" className="header-icon" />
                    <span className="version">VERSION 1.0</span>
                    <button className="button button-regresar" onClick={handleLogout}>
                        SALIR
                    </button>
                </div>
            </div>

            <div className="main-menu-content">
                <div className="main-menu-options">
                    {menuOptions.map((option, index) => (
                        <button
                            key={index}
                            className="button"
                            onClick={() => navigate(option.path)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="main-menu-right-panel">
                    <img src={UserFigure} alt="Figura de usuario" className="user-figure" />
                    <div className="whiteboard">
                        <p>Bienvenido: {user?.name}</p>
                        <p>Email: {user?.email}</p>
                        <p>Notas: {user?.notes}</p>
                    </div>
                </div>
            </div>

            <div className="footer-info">
                <p>NEGOCIO TUNDAMA LTDA</p>
                <p>VERSION 1.0</p>
            </div>
        </div>
    );
};

export default Menu;