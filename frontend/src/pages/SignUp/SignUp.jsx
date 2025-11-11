import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const navigate = useNavigate();

    return (
        <div className="container client-module-container">
            <div className="header">
                <div className="header-left">
                    <img src="/img/logo.png" alt="Logo" className="header-logo" />
                    <h1>CARLOS MODULO SINGUP</h1>
                </div>
                <div className="header-right">
                    <img src="/img/user_icon.png" alt="Usuario" className="header-icon" />
                    <span className="version">VERSION 1.0</span>
                    <button
                        className="button button-regresar"
                        onClick={() => navigate('/login')}
                    >
                        REGRESAR
                    </button>
                </div>
            </div>

            <div className="content">
                <h2>Módulo de Registro - En Desarrollo</h2>
                <p>Esta funcionalidad estará disponible pronto.</p>
            </div>
        </div>
    );
};

export default SignUp;