// src/components/forms/CreateAccount.jsx
import { useState } from 'react';

function CreateAccount({ onClose, onAccountCreated, standalone = false, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '', // NOUVEAU : champ de confirmation
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

    // NOUVEAU : Vérification que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
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
      
      if (onAccountCreated) {
        // On envoie les données sans le confirmPassword
        const { confirmPassword, ...userData } = formData;
        onAccountCreated(userData);
      }

      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '', // NOUVEAU
        role: '',
        department: ''
      });

      // Fermer après 2 secondes seulement si c'est une modale
      if (!standalone) {
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        // En mode standalone, on efface juste le message après 3 secondes
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
      
      setLoading(false);
    }, 1500);
  };

  // Styles conditionnels selon le mode (modale ou page)
  const containerStyle = standalone ? styles.pageContainer : styles.modalOverlay;
  const contentStyle = standalone ? styles.pageContent : styles.modalContent;

  return (
    <div style={containerStyle} onClick={!standalone ? onClose : undefined}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        
        <div style={styles.header}>
          <h2 style={styles.title}>
            <span style={{ fontSize: "2rem" }}>👤</span> 
            Créer un nouveau compte
          </h2>
          {!standalone && (
            <button
              onClick={onClose}
              style={styles.closeButton}
            >
              ✕
            </button>
          )}
        </div>

        {/* Message de confirmation/erreur */}
        {message.text && (
          <div style={{
            ...styles.messageBox,
            backgroundColor: message.type === "success" ? "#c6f6d5" : 
                           message.type === "error" ? "#fed7d7" : "#e6f7ff",
            color: message.type === "success" ? "#22543d" : 
                   message.type === "error" ? "#742a2a" : "#0052cc",
            borderColor: message.type === "success" ? "#9ae6b4" : 
                        message.type === "error" ? "#feb2b2" : "#91d5ff"
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Prénom */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Prénom <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder=""
            />
          </div>

          {/* Nom */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Nom <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder=""
            />
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="@exemple.com"
            />
          </div>

          {/* Mot de passe */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Mot de passe <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
              minLength="6"
              placeholder=""
            />
          </div>

          {/* NOUVEAU : Confirmation du mot de passe */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Confirmer le mot de passe <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? '#f56565' 
                  : formData.confirmPassword && formData.password === formData.confirmPassword 
                    ? '#48bb78' 
                    : '#e2e8f0'
              }}
              required
              placeholder=""
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <small style={{...styles.inputHelp, color: '#f56565'}}>
                Les mots de passe ne correspondent pas
              </small>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <small style={{...styles.inputHelp, color: '#48bb78'}}>
                ✓ Les mots de passe correspondent
              </small>
            )}
            <small style={styles.inputHelp}>
              Minimum 6 caractères
            </small>
          </div>

          {/* Rôle - champ texte */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Rôle <span style={{ color: "#f56565" }}>*</span>
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Ex: Administrateur, Manager, Commercial..."
            />
          </div>

          {/* Département - champ texte */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Département
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ex: Direction, Commercial, IT..."
            />
          </div>

          {/* Boutons - différents selon le mode */}
          {!standalone ? (
            <div style={styles.buttonContainer}>
              <button
                type="button"
                onClick={onClose}
                style={styles.cancelButton}
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
                style={loading ? { ...styles.submitButton, ...styles.loadingStyle } : styles.submitButton}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.background = "#38a169";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.background = "#48bb78";
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}></span>
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
          ) : (
            <div style={styles.pageButtonContainer}>
              <button
                type="button"
                onClick={onCancel}
                style={styles.cancelButtonLarge}
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
                style={loading ? { ...styles.submitButtonLarge, ...styles.loadingStyle } : styles.submitButtonLarge}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.background = "#38a169";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.background = "#48bb78";
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}></span>
                    Création en cours...
                  </>
                ) : (
                  "Créer le compte"
                )}
              </button>
            </div>
          )}
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

// Styles unifiés
const styles = {
  // Mode modale
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(5px)"
  },
  modalContent: {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    width: "500px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  },
  
  // Mode page
  pageContainer: {
    width: "100%",
    background: "transparent"
  },
  pageContent: {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },

  // Styles communs
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  title: {
    fontSize: "1.5rem",
    color: "#1a202c",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#a0aec0",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "all 0.3s"
  },
  messageBox: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 600,
    color: "#4a5568",
    fontSize: "0.95rem"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.3s",
    backgroundColor: "white",
    boxSizing: "border-box"
  },
  inputHelp: {
    color: "#718096",
    fontSize: "0.8rem",
    marginTop: "4px",
    display: "block"
  },
  buttonContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
    marginTop: "10px"
  },
  pageButtonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
    marginTop: "10px"
  },
  cancelButton: {
    padding: "10px 20px",
    background: "white",
    color: "#4a5568",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s"
  },
  cancelButtonLarge: {
    padding: "12px 30px",
    background: "white",
    color: "#4a5568",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
    marginRight: "12px"
  },
  submitButton: {
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
  },
  submitButtonLarge: {
    padding: "12px 30px",
    background: "#48bb78",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  loadingStyle: {
    background: "#a0aec0",
    cursor: "not-allowed",
    opacity: 0.7
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid white",
    borderRadius: "50%",
    borderTopColor: "transparent",
    animation: "spin 0.8s linear infinite",
    display: "inline-block"
  }
};

export default CreateAccount;