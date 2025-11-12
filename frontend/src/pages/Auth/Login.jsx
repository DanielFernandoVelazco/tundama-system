import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import LogoImage from '../../img/logo.png';
import UserIcon from '../../img/user_icon.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/menu');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <img src={LogoImage} alt="Logo" className="login-logo" />
                <h1>BIENVENIDO AL MODULO DE NEGOCIO TUNDAMA LTDA</h1>
            </div>

            <div className="login-content">
                <div className="login-form-row">
                    <img src={UserIcon} alt="Usuario" className="login-user-icon" />
                    <div className="login-input-group">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="usuario">USUARIO</label>
                                <input
                                    type="text"
                                    id="usuario"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Ingrese su email"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="clave">CLAVE</label>
                                <input
                                    type="password"
                                    id="clave"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="******"
                                    required
                                />
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="login-buttons-container">
                                <button type="submit" className="button" disabled={loading}>
                                    {loading ? 'CARGANDO...' : 'INGRESAR'}
                                </button>
                                <button type="button" className="button">CANCELAR</button>
                                <Link to="/signup" className="button">SIGN UP</Link>
                            </div>
                        </form>
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

export default Login;