// src/components/forms/CreateAccount.jsx
import { useState } from 'react';

function CreateAccount({ onClose, onAccountCreated }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    department: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.role) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: "Format d'email invalide" });
      return false;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: 'info', text: 'Création du compte en cours...' });

    // Simulation d'un appel API
    setTimeout(() => {
      console.log("Données du formulaire:", formData);
      
      setMessage({ type: 'success', text: 'Compte créé avec succès !' });
      
      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        department: ''
      });

      if (onAccountCreated) {
        onAccountCreated(formData);
      }

      // Fermer la modale après 2 secondes
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "32px",
        width: "500px",
        maxWidth: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "1.5rem",
            color: "#1a202c",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: 0
          }}>
            <span style={{ fontSize: "2rem" }}>👤</span> 
            Créer un nouveau compte
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#a0aec0"
            }}
          >
            ✕
          </button>
        </div>

        {/* Message de confirmation/erreur */}
        {message.text && (
          <div style={{
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "20px",
            background: message.type === "success" ? "#c6f6d5" : 
                       message.type === "error" ? "#fed7d7" : "#e6f7ff",
            color: message.type === "success" ? "#22543d" : 
                   message.type === "error" ? "#742a2a" : "#0052cc",
            border: `1px solid ${message.type === "success" ? "#9ae6b4" : 
                               message.type === "error" ? "#feb2b2" : "#91d5ff"}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Prénom */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Prénom <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={inputStyle}
              required
              placeholder=""
            />
          </div>

          {/* Nom */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Nom <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={inputStyle}
              required
              placeholder=""
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Email <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
              placeholder="@exemple.com"
            />
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Mot de passe <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              required
              minLength="6"
              placeholder=""
            />
            <small style={{ color: "#718096", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
              Minimum 6 caractères
            </small>
          </div>

          {/* Rôle - champ texte */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              Rôle <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={inputStyle}
              required
              placeholder="Ex: Administrateur, Manager, Commercial..."
            />
          </div>

          {/* Département - champ texte */}
          <div style={{ marginBottom: "30px" }}>
            <label style={labelStyle}>
              Département
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Direction, Commercial, IT..."
            />
          </div>

          {/* Boutons */}
          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={onClose}
              style={cancelButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = "#f7fafc";
                e.target.style.borderColor = "#cbd5e0";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={loading ? { ...submitButtonStyle, ...loadingStyle } : submitButtonStyle}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = "#38a169";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = "#48bb78";
              }}
            >
              {loading ? (
                <>
                  <span style={spinnerStyle}></span>
                  Création...
                </>
              ) : (
                <>
                  <span>➕</span>
                  Créer le compte
                </>
              )}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// Styles
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
  color: "#4a5568",
  fontSize: "0.95rem"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.3s",
  backgroundColor: "white",
  boxSizing: "border-box"
};

const buttonContainerStyle = {
  display: "flex",
  gap: "12px",
  justifyContent: "flex-end",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "20px"
};

const cancelButtonStyle = {
  padding: "10px 20px",
  background: "white",
  color: "#4a5568",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.3s"
};

const submitButtonStyle = {
  padding: "10px 20px",
  background: "#48bb78",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.3s",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const loadingStyle = {
  background: "#a0aec0",
  cursor: "not-allowed",
  opacity: 0.7
};

const spinnerStyle = {
  width: "16px",
  height: "16px",
  border: "2px solid white",
  borderRadius: "50%",
  borderTopColor: "transparent",
  animation: "spin 0.8s linear infinite",
  display: "inline-block"
};

export default CreateAccount;