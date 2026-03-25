import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { clearAuth, getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"

function Admin() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editingModule, setEditingModule] = useState(null)

  // Données des modules avec état actif/désactivé
  const [modules, setModules] = useState([
    {
      id: 1,
      name: "Tableau de bord",
      description: "Vue d'ensemble de l'activité",
      icon: "📊",
      color: "#667eea",
      path: "/dashboard",
      stats: "Accès global",
      active: true,
      editable: false
    },
    {
      id: 2,
      name: "Gestion du Stock",
      description: "Gérer les produits, inventaires et mouvements",
      icon: "📦",
      color: "#48bb78",
      path: "/stock",
      stats: "156 produits",
      active: true,
      editable: true
    },
    {
      id: 3,
      name: "Gestion Financière",
      description: "Suivre les transactions, dépenses et revenus",
      icon: "💰",
      color: "#4299e1",
      path: "/finance",
      stats: "15,230 €",
      active: true,
      editable: true
    },
    {
      id: 4,
      name: "Facturation",
      description: "Créer et gérer les factures et clients",
      icon: "📄",
      color: "#ed8936",
      path: "/facturation",
      stats: "24 factures",
      active: true,
      editable: true
    }
  ])

  // Stats dynamiques basées sur les modules actifs
  const stats = [
    { 
      id: 1, 
      title: "STOCK", 
      value: modules.find(m => m.name === "Gestion du Stock")?.active ? "156" : "0", 
      label: "produits", 
      icon: "📦", 
      color: "#48bb78" 
    },
    { 
      id: 2, 
      title: "FINANCE", 
      value: modules.find(m => m.name === "Gestion Financière")?.active ? "15,230€" : "0€", 
      label: "revenus", 
      icon: "💰", 
      color: "#4299e1" 
    },
    { 
      id: 3, 
      title: "FACTURATION", 
      value: modules.find(m => m.name === "Facturation")?.active ? "24" : "0", 
      label: "factures", 
      icon: "📄", 
      color: "#ed8936" 
    },
    { 
      id: 4, 
      title: "UTILISATEURS", 
      value: "4", 
      label: "actifs", 
      icon: "👥", 
      color: "#9f7aea" 
    }
  ]

  useEffect(() => {
    const role = getUserRole()
    const email = getUserEmail()
    
    if (!isAuthenticated() || role !== "admin_principal") {
      navigate("/login")
    } else {
      setUserEmail(email)
      setUserName(email?.split('@')[0] || "Admin")
      setLoading(false)
    }
  }, [navigate])

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  const handleNavigate = (path, active) => {
    if (active) {
      navigate(path)
    }
  }

  // Fonction pour activer/désactiver un module
  const toggleModuleActive = (moduleId) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, active: !module.active }
        : module
    ))
  }

  // Fonction pour ouvrir le modal d'édition
  const openEditModal = (module) => {
    setEditingModule({ ...module })
  }

  // Fonction pour fermer le modal d'édition
  const closeEditModal = () => {
    setEditingModule(null)
  }

  // Fonction pour sauvegarder les modifications du module
  const saveModuleChanges = () => {
    if (editingModule) {
      setModules(modules.map(module => 
        module.id === editingModule.id ? editingModule : module
      ))
      closeEditModal()
    }
  }

  // Fonction pour mettre à jour le module en cours d'édition
  const updateEditingModule = (field, value) => {
    setEditingModule({
      ...editingModule,
      [field]: value
    })
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white"
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          borderTopColor: "white",
          animation: "spin 0.8s linear infinite"
        }}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#f7fafc"
    }}>
      {/* Modal d'édition */}
      {editingModule && (
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
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "32px",
            width: "500px",
            maxWidth: "90%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1a202c",
              marginBottom: "24px"
            }}>
              Modifier le module
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#4a5568",
                marginBottom: "8px"
              }}>
                Nom du module
              </label>
              <input
                type="text"
                value={editingModule.name}
                onChange={(e) => updateEditingModule("name", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#4a5568",
                marginBottom: "8px"
              }}>
                Description
              </label>
              <textarea
                value={editingModule.description}
                onChange={(e) => updateEditingModule("description", e.target.value)}
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#4a5568",
                marginBottom: "8px"
              }}>
                Statistique
              </label>
              <input
                type="text"
                value={editingModule.stats}
                onChange={(e) => updateEditingModule("stats", e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#4a5568",
                marginBottom: "8px"
              }}>
                Couleur
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="color"
                  value={editingModule.color}
                  onChange={(e) => updateEditingModule("color", e.target.value)}
                  style={{
                    width: "60px",
                    height: "44px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    cursor: "pointer"
                  }}
                />
                <input
                  type="text"
                  value={editingModule.color}
                  onChange={(e) => updateEditingModule("color", e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={closeEditModal}
                style={{
                  padding: "12px 24px",
                  background: "#e2e8f0",
                  color: "#1a202c",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                Annuler
              </button>
              <button
                onClick={saveModuleChanges}
                style={{
                  padding: "12px 24px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDEBAR GAUCHE ===== */}
      <div style={{
        width: "280px",
        background: "white",
        boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e2e8f0",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100
      }}>
        {/* En-tête ERP Administration */}
        <div style={{
          padding: "32px 24px",
          borderBottom: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #667eea08, #764ba208)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px"
          }}>
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#667eea"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <div>
              <h1 style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#1a202c",
                margin: 0,
                lineHeight: 1.2
              }}>ERP</h1>
              <p style={{
                fontSize: "0.8rem",
                color: "#718096",
                margin: 0,
                fontWeight: 500
              }}>Administration</p>
            </div>
          </div>
          
          <span style={{
            background: "#667eea",
            color: "white",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            display: "inline-block",
            width: "fit-content"
          }}>
            ADMINISTRATEUR PRINCIPAL
          </span>
        </div>

        {/* Profil utilisateur */}
        <div style={{
          padding: "24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.2rem",
            fontWeight: 700,
            marginBottom: "16px",
            boxShadow: "0 4px 12px rgba(102,126,234,0.3)"
          }}>
            A
          </div>
          <div style={{ fontWeight: 700, color: "#1a202c", fontSize: "1.1rem", marginBottom: "4px" }}>
            {userName || "Admin"}
          </div>
          <div style={{ color: "#718096", fontSize: "0.9rem", marginBottom: "16px" }}>
            {userEmail || "admin@test.com"}
          </div>
        </div>

        {/* MENU PRINCIPAL */}
        <div style={{
          padding: "24px",
          flex: 1
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px"
          }}>
            <p style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#a0aec0",
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: 0
            }}>MENU PRINCIPAL</p>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: "6px 12px",
                background: editMode ? "#667eea" : "#e2e8f0",
                color: editMode ? "white" : "#4a5568",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              {editMode ? "Mode édition" : "Activer édition"}
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { icon: "📊", name: "Dashboard", path: "/dashboard", active: true },
              { icon: "📦", name: "Stock", path: "/stock", active: modules.find(m => m.name === "Gestion du Stock")?.active },
              { icon: "💰", name: "Finance", path: "/finance", active: modules.find(m => m.name === "Gestion Financière")?.active },
              { icon: "📄", name: "Facturation", path: "/facturation", active: modules.find(m => m.name === "Facturation")?.active }
            ].map((item, index) => (
              <div
                key={index}
                onClick={() => handleNavigate(item.path, item.active)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  cursor: item.active ? "pointer" : "not-allowed",
                  transition: "all 0.3s",
                  color: item.active ? "#4a5568" : "#cbd5e0",
                  opacity: item.active ? 1 : 0.6,
                  background: !item.active ? "#f7fafc" : "transparent"
                }}
                onMouseEnter={(e) => {
                  if (item.active) {
                    e.currentTarget.style.background = "#f7fafc";
                    e.currentTarget.style.color = "#667eea";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = item.active ? "#4a5568" : "#cbd5e0";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                {!item.active && (
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    background: "#fed7d7",
                    color: "#e53e3e",
                    borderRadius: "12px",
                    marginLeft: "auto"
                  }}>
                    désactivé
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOUTON DE DECONNEXION EN BAS */}
        <div style={{
          padding: "24px",
          borderTop: "1px solid #e2e8f0",
          marginTop: "auto"
        }}>
          <button
            onClick={handleLogout}
            style={{
              padding: "12px 20px",
              background: "#f56565",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#c53030";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(245,101,101,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#f56565";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3C2.46957 3 1.96086 3.21071 1.58579 3.58579C1.21071 3.96086 1 4.46957 1 5V15C1 15.5304 1.21071 16.0391 1.58579 16.4142C1.96086 16.7893 2.46957 17 3 17H8V15H3V5H8V3H3Z" />
              <path d="M16 5L20 10L16 15L14.59 13.59L17.17 11H8V9H17.17L14.59 6.41L16 5Z" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div style={{
        flex: 1,
        marginLeft: "280px",
        padding: "32px",
        background: "#f7fafc"
      }}>
        {/* Panneau d'administration */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h2 style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#1a202c",
            marginBottom: "12px"
          }}>
            Panneau d'administration
          </h2>
          <p style={{
            color: "#718096",
            fontSize: "1.1rem",
            marginBottom: "16px"
          }}>
            Accédez à tous les modules de l'application depuis cette interface
          </p>
          {editMode && (
            <div style={{
              padding: "12px",
              background: "#fefcbf",
              borderRadius: "8px",
              color: "#744210",
              fontSize: "0.9rem"
            }}>
              ✏️ Mode édition activé - Vous pouvez activer/désactiver et modifier les modules
            </div>
          )}
        </div>

        {/* Aperçu général - Stats */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#1a202c",
            marginBottom: "20px"
          }}>
            Aperçu général
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px"
          }}>
            {stats.map(stat => (
              <div
                key={stat.id}
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                  borderBottom: `4px solid ${stat.value === "0" || stat.value === "0€" ? "#cbd5e0" : stat.color}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.3s",
                  opacity: stat.value === "0" || stat.value === "0€" ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  background: stat.value === "0" || stat.value === "0€" ? "#e2e8f0" : `${stat.color}15`,
                  color: stat.value === "0" || stat.value === "0€" ? "#a0aec0" : stat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  marginBottom: "16px"
                }}>
                  {stat.icon}
                </div>
                <h4 style={{
                  color: "#718096",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  marginBottom: "8px"
                }}>{stat.title}</h4>
                <p style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: stat.value === "0" || stat.value === "0€" ? "#a0aec0" : "#1a202c",
                  lineHeight: 1.2,
                  marginBottom: "4px"
                }}>{stat.value}</p>
                <span style={{
                  color: "#a0aec0",
                  fontSize: "0.85rem"
                }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tous les modules */}
        <div>
          <h3 style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            color: "#1a202c",
            marginBottom: "20px"
          }}>
            Tous les modules
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px"
          }}>
            {modules.map(module => (
              <div
                key={module.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  transition: "all 0.3s",
                  border: "1px solid #e2e8f0",
                  borderTop: `4px solid ${module.active ? module.color : "#cbd5e0"}`,
                  opacity: module.active ? 1 : 0.8,
                  position: "relative"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Badge Actif/Désactivé */}
                <div style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  padding: "4px 12px",
                  borderRadius: "16px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: module.active ? "#c6f6d5" : "#fed7d7",
                  color: module.active ? "#22543d" : "#742a2a"
                }}>
                  {module.active ? "Actif" : "Désactivé"}
                </div>

                {/* Boutons d'action pour les modules éditables */}
                {module.editable && editMode && (
                  <div style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "16px",
                    display: "flex",
                    gap: "8px"
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModuleActive(module.id);
                      }}
                      style={{
                        padding: "8px 12px",
                        background: module.active ? "#f56565" : "#48bb78",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = module.active ? "#c53030" : "#2f855a";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = module.active ? "#f56565" : "#48bb78";
                      }}
                    >
                      {module.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(module);
                      }}
                      style={{
                        padding: "8px 12px",
                        background: "#4299e1",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#2b6cb0";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#4299e1";
                      }}
                    >
                      Modifier
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "12px",
                    background: module.active ? `${module.color}15` : "#e2e8f0",
                    color: module.active ? module.color : "#a0aec0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                    flexShrink: 0
                  }}>
                    {module.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: module.active ? "#1a202c" : "#718096",
                      marginBottom: "8px"
                    }}>{module.name}</h4>
                    <p style={{
                      color: module.active ? "#718096" : "#a0aec0",
                      fontSize: "0.9rem",
                      marginBottom: "12px",
                      lineHeight: 1.5
                    }}>{module.description}</p>
                    <div style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "16px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      background: module.active ? "#f7fafc" : "#edf2f7",
                      color: module.active ? "#4a5568" : "#a0aec0",
                      border: "1px solid #e2e8f0"
                    }}>
                      {module.stats}
                    </div>
                  </div>
                </div>
                
                {module.active && (
                  <div
                    onClick={() => handleNavigate(module.path, module.active)}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      marginTop: "8px",
                      cursor: "pointer"
                    }}
                  >
                    <span style={{
                      color: module.color,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      Accéder
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 12L10 8L6 4" stroke={module.color} strokeWidth="1.5"/>
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
