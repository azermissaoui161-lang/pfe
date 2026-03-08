// src/components/forms/AccountSettings.jsx
import React from 'react'

function AccountSettings({ 
  userSettings, 
  handleSettingsChange, 
  handleSaveSettings, 
  settingsMessage, 
  updating,
  onClose,
  standalone = false 
}) {
  return (
    <div style={styles.settingsForm}>
      {settingsMessage.text && (
        <div style={{
          ...styles.messageBox,
          backgroundColor: settingsMessage.type === "success" ? "#c6f6d5" : 
                         settingsMessage.type === "error" ? "#fed7d7" : "#e6f7ff",
          color: settingsMessage.type === "success" ? "#22543d" : 
                 settingsMessage.type === "error" ? "#742a2a" : "#0052cc",
          borderColor: settingsMessage.type === "success" ? "#9ae6b4" : 
                      settingsMessage.type === "error" ? "#feb2b2" : "#91d5ff"
        }}>
          {settingsMessage.text}
        </div>
      )}

      {/* Section Informations personnelles */}
      <div style={styles.formSection}>
        <h3 style={styles.sectionSubtitle}>Informations personnelles</h3>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Prénom</label>
            <input
              type="text"
              name="firstName"
              value={userSettings.firstName}
              onChange={handleSettingsChange}
              style={styles.input}
              placeholder="Votre prénom"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom</label>
            <input
              type="text"
              name="lastName"
              value={userSettings.lastName}
              onChange={handleSettingsChange}
              style={styles.input}
              placeholder="Votre nom"
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={userSettings.email}
              onChange={handleSettingsChange}
              style={styles.input}
              placeholder="votre@email.com"
            />
          </div>
          
          
        </div>
      </div>

      {/* Section Informations professionnelles */}
      <div style={styles.formSection}>
        <h3 style={styles.sectionSubtitle}>Informations professionnelles</h3>
        
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Département</label>
            <select
              name="department"
              value={userSettings.department}
              onChange={handleSettingsChange}
              style={styles.input}
            >
              <option value="Direction">Direction</option>
              <option value="Commercial">Commercial</option>
              <option value="Comptabilité">Comptabilité</option>
              <option value="Stock">Gestion de stock</option>
              <option value="Ressources Humaines">Ressources Humaines</option>
              <option value="Informatique">Informatique</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Rôle</label>
            <input
              type="text"
              name="role"
              value={userSettings.role}
              style={{...styles.input, backgroundColor: '#f7fafc'}}
              disabled
              placeholder="Rôle système"
            />
            <small style={styles.inputHelp}>Le rôle ne peut pas être modifié</small>
          </div>
        </div>
      </div>

      {/* Section Changement de mot de passe */}
      <div style={styles.formSection}>
        <h3 style={styles.sectionSubtitle}>Changer le mot de passe</h3>
        <p style={styles.sectionHint}>Laissez vide si vous ne souhaitez pas changer votre mot de passe</p>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Mot de passe actuel</label>
          <input
            type="password"
            name="currentPassword"
            value={userSettings.currentPassword}
            onChange={handleSettingsChange}
            style={styles.input}
            placeholder="••••••••"
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nouveau mot de passe</label>
            <input
              type="password"
              name="newPassword"
              value={userSettings.newPassword}
              onChange={handleSettingsChange}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmer</label>
            <input
              type="password"
              name="confirmPassword"
              value={userSettings.confirmPassword}
              onChange={handleSettingsChange}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>
        </div>
        <small style={styles.inputHelp}>Minimum 6 caractères</small>
      </div>

      {!standalone && (
        <div style={styles.modalActions}>
          <button onClick={onClose} style={styles.cancelButton}>
            Annuler
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={updating}
            style={{
              ...styles.saveButton,
              backgroundColor: updating ? "#a0aec0" : "#667eea",
              cursor: updating ? "not-allowed" : "pointer"
            }}
          >
            {updating ? "Mise à jour..." : "Enregistrer les modifications"}
          </button>
        </div>
      )}
      
      {standalone && (
        <div style={styles.pageActions}>
          <button
            onClick={handleSaveSettings}
            disabled={updating}
            style={{
              ...styles.saveButtonLarge,
              backgroundColor: updating ? "#a0aec0" : "#667eea",
              cursor: updating ? "not-allowed" : "pointer"
            }}
          >
            {updating ? "Mise à jour en cours..." : "Enregistrer les modifications"}
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  settingsForm: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  messageBox: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid"
  },
  formSection: {
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "20px"
  },
  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#2d3748",
    margin: "0 0 12px 0"
  },
  sectionHint: {
    fontSize: "0.85rem",
    color: "#a0aec0",
    margin: "-8px 0 16px 0"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px"
  },
  formGroup: {
    marginBottom: "12px",
    flex: 1
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    color: "#4a5568",
    fontSize: "0.9rem"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.3s",
    boxSizing: "border-box"
  },
  inputHelp: {
    display: "block",
    fontSize: "0.75rem",
    color: "#a0aec0",
    marginTop: "4px"
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px"
  },
  pageActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "24px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px"
  },
  cancelButton: {
    padding: "10px 20px",
    background: "white",
    color: "#4a5568",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s"
  },
  saveButton: {
    padding: "10px 20px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "all 0.3s"
  },
  saveButtonLarge: {
    padding: "12px 30px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 600,
    transition: "all 0.3s"
  }
}

export default AccountSettings