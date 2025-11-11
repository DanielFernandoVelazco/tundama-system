import React from 'react';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
    const navigate = useNavigate();

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

            <div className="content">
                <h2>Módulo de Clientes - En Desarrollo</h2>
                <p>Esta funcionalidad estará disponible pronto.</p>
            </div>
        </div>
    );
};

export default Clients;