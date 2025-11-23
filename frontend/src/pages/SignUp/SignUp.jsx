import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './SignUp.css';
import '../../styles/shared-styles.css';
import LogoImage from '../../img/logo.png';
import UserImage from '../../img/user_icon.png';

const SignUp = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        identification: '',
        identificationType: 'NIT',
        phone: '',
        address: '',
        email: '',
        password: '',
        confirmPassword: '',
        notes: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            setLoading(true);

            // Preparar datos para enviar (sin confirmPassword)
            const { confirmPassword, ...userData } = formData;

            // Usar authService.signup en lugar de userService.create
            await authService.signup(userData);
            setSuccess('Usuario registrado correctamente. Ahora puedes iniciar sesión.');

            // Limpiar formulario después de éxito
            setFormData({
                name: '',
                identification: '',
                identificationType: 'NIT',
                phone: '',
                address: '',
                email: '',
                password: '',
                confirmPassword: '',
                notes: ''
            });

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            setError(error.response?.data?.message || 'Error al registrar el usuario');
            console.error('Error creating user:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            identification: '',
            identificationType: 'NIT',
            phone: '',
            address: '',
            email: '',
            password: '',
            confirmPassword: '',
            notes: ''
        });
        setError('');
        setSuccess('');
    };

    return (
        <div className="module-container">
            <div className="header">
                <div className="header-left">
                    <img src={LogoImage} alt="Logo" className="header-logo" />
                    <h1>MODULO SINGUP</h1>
                </div>
                <div className="header-right">
                    <img src={UserImage} alt="Usuario" className="header-icon" />
                    <span className="version-menu">VERSION 1.0</span>
                    <button
                        className="button"
                        onClick={() => navigate('/login')}
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

                    {/* Grupo de nombre */}
                    <div className="form-group">
                        <label htmlFor="name">NOMBRE</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="full-width-input"
                            required
                        />
                    </div>

                    {/* Grupo de identificación - CON RADIO BUTTONS TRADICIONALES */}
                    <div className="form-group-clients type-selector">
                        <label htmlFor="identification"># IDENTIFICACIÓN</label>
                        <div className="identification-input-container">
                            <input
                                type="text"
                                id="identification"
                                name="identification"
                                value={formData.identification}
                                onChange={handleInputChange}
                                required
                                className="medium-input"
                            />
                            <div className="segment-buttons">
                                <button
                                    type="button"
                                    className={`segment-button ${formData.identificationType === 'NIT' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, identificationType: 'NIT' }))}
                                >
                                    NIT
                                </button>
                                <button
                                    type="button"
                                    className={`segment-button ${formData.identificationType === 'CEDULA' ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, identificationType: 'CEDULA' }))}
                                >
                                    CÉDULA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grupo de teléfono */}
                    <div className="form-group">
                        <label htmlFor="phone">TELÉFONO</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="medium-input"
                            required
                        />
                    </div>

                    {/* Grupo de dirección */}
                    <div className="form-group">
                        <label htmlFor="address">DIRECCIÓN</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="full-width-input"
                            required
                        />
                    </div>

                    {/* Grupo de email */}
                    <div className="form-group">
                        <label htmlFor="email">E-MAIL</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="full-width-input"
                            required
                        />
                    </div>

                    {/* Grupo de contraseña */}
                    <div className="form-group">
                        <label htmlFor="password">CONTRASEÑA</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="******"
                            className="medium-input"
                            required
                        />
                    </div>

                    {/* Grupo de confirmar contraseña */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="******"
                            className="medium-input"
                            required
                        />
                    </div>

                    {/* Grupo de notas */}
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

                    {/* Grupo de botones */}
                    <div className="button-group">
                        <button
                            type="submit"
                            className="button primary"
                            disabled={loading}
                        >
                            {loading ? 'REGISTRANDO...' : 'REGISTRAR'}
                        </button>
                        <button
                            type="button"
                            className="button secondary"
                            onClick={resetForm}
                        >
                            LIMPIAR
                        </button>
                    </div>
                </form>
            </div>

            <div className="footer-info">
                <p>NEGOCIO TUNDAMA LTDA</p>
                <p>TODOS LOS DERECHOS RESERVADOS</p>
            </div>
        </div>
    );
};

export default SignUp;