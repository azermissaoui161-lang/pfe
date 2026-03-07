// src/pages/admin/Admin.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"
import authService from "../../services/authService"
import CreateAccount from "../../components/forms/CreateAccount"

function Admin() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // État pour les paramètres utilisateur (toutes les informations)
  const [userSettings, setUserSettings] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [settingsMessage, setSettingsMessage] = useState({ type: "", text: "" })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // État pour le filtre des modules
  const [showModuleFilter, setShowModuleFilter] = useState(false)
  
  // Modules de base
  const [baseModules, setBaseModules] = useState([
    { id: 'facturation', name: 'Facturation', icon: '💰', color: '#667eea', count: 12, active: true, type: 'base' },
    { id: 'stock', name: 'Stock', icon: '📦', color: '#9f7aea', count: 8, active: true, type: 'base' },
    { id: 'finance', name: 'Finance', icon: '💵', color: '#ed8936', count: 5, active: true, type: 'base' },
  ])

  // Modules personnalisés (comptes créés)
  const [customModules, setCustomModules] = useState([])

  // Fusionner tous les modules pour le filtre
  const allModules = [...baseModules, ...customModules]

  // Couleurs pour les nouveaux modules
  const moduleColors = [
    '#48bb78', '#f56565', '#ed64a6', '#9f7aea', '#4299e1', '#ed8936', '#667eea', '#38a169'
  ]

  const pages = [
    { id: 1, name: 'Dashboard Facturation', path: '/facturation/dashboard', icon: '💰', color: '#667eea', module: 'facturation' },
    { id: 2, name: 'Dashboard Stock', path: '/stock/dashboard', icon: '📦', color: '#9f7aea', module: 'stock' },
    { id: 3, name: 'Dashboard Finance', path: '/finance/dashboard', icon: '💵', color: '#ed8936', module: 'finance' },
    { id: 4, name: 'Gestion Stock', path: '/stock', icon: '📦', color: '#9f7aea', module: 'stock' },
    { id: 5, name: 'Gestion Facturation', path: '/facturation', icon: '📋', color: '#38a169', module: 'facturation' },
    { id: 6, name: 'Gestion Finance', path: '/finance', icon: '📄', color: '#ed8936', module: 'finance' },
    { id: 7, name: 'Créer un compte', path: '#', icon: '➕', color: '#48bb78', action: 'create' },
    { id: 8, name: 'Paramètres', path: '#', icon: '⚙️', color: '#4a5568', action: 'settings' },
  ]

  // Générer des pages pour les modules personnalisés
  const getCustomPages = () => {
    return customModules.flatMap((module, index) => [
      { 
        id: 100 + (index * 2), 
        name: `Dashboard ${module.name}`, 
        path: `/${module.id}/dashboard`, 
        icon: module.icon, 
        color: module.color, 
        module: module.id 
      },
      { 
        id: 101 + (index * 2), 
        name: `Gestion ${module.name}`, 
        path: `/${module.id}`, 
        icon: '📋', 
        color: module.color, 
        module: module.id 
      }
    ])
  }

  // Toutes les pages (base + personnalisées)
  const allPages = [...pages, ...getCustomPages()]

  // Filtrer les pages selon les modules actifs
  const getFilteredPages = () => {
    return allPages.filter(page => {
      if (page.action) return true
      if (!page.module) return true
      const module = allModules.find(m => m.id === page.module)
      return module ? module.active : true
    })
  }

  const displayedPages = getFilteredPages()
  
  const filteredPages = displayedPages.filter(page => 
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fonction pour activer/désactiver un module
  const toggleModule = (moduleId) => {
    if (moduleId.startsWith('custom_')) {
      setCustomModules(customModules.map(module => 
        module.id === moduleId 
          ? { ...module, active: !module.active }
          : module
      ))
    } else {
      setBaseModules(baseModules.map(module => 
        module.id === moduleId 
          ? { ...module, active: !module.active }
          : module
      ))
    }
  }

  // Compter tous les modules actifs
  const activeModulesCount = allModules.filter(m => m.active).length

  useEffect(() => {
    const role = getUserRole()
    const email = getUserEmail()
    
    if (!isAuthenticated() || role !== "admin_principal") {
      navigate("/login")
    } else {
      setUserEmail(email)
      setUserName(email?.split('@')[0] || "Admin")
      
      // Initialiser les paramètres avec les informations disponibles
      setUserSettings({
        ...userSettings,
        email: email || "",
        firstName: localStorage.getItem('userFirstName') || "Admin",
        lastName: localStorage.getItem('userLastName') || "",
        phone: localStorage.getItem('userPhone') || "",
        department: localStorage.getItem('userDepartment') || "Direction",
        role: role || "admin_principal"
      })
      
      setLoading(false)
    }
  }, [navigate])

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  // Gérer les changements dans le formulaire
  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setUserSettings({
      ...userSettings,
      [name]: value
    })
  }

  // Ouvrir la modale des paramètres
  const handleSettingsClick = () => {
    setShowSettings(true)
    setSettingsMessage({ type: "", text: "" })
  }

  // Fermer la modale
  const handleCloseSettings = () => {
    setShowSettings(false)
    setSettingsMessage({ type: "", text: "" })
    setUpdating(false)
  }

  // Sauvegarder toutes les modifications
  const handleSaveSettings = async () => {
    // Validation des champs obligatoires
    if (!userSettings.firstName) {
      setSettingsMessage({ type: "error", text: "Le prénom ne peut pas être vide" })
      return
    }
    
    if (!userSettings.lastName) {
      setSettingsMessage({ type: "error", text: "Le nom ne peut pas être vide" })
      return
    }

    if (!userSettings.email) {
      setSettingsMessage({ type: "error", text: "L'email ne peut pas être vide" })
      return
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userSettings.email)) {
      setSettingsMessage({ type: "error", text: "Format d'email invalide" })
      return
    }

    // Validation du téléphone si présent
    if (userSettings.phone && !/^[0-9+\-\s]+$/.test(userSettings.phone)) {
      setSettingsMessage({ type: "error", text: "Format de téléphone invalide" })
      return
    }

    // Vérifier si on change le mot de passe
    const changingPassword = userSettings.newPassword || userSettings.confirmPassword || userSettings.currentPassword

    if (changingPassword) {
      if (!userSettings.currentPassword) {
        setSettingsMessage({ type: "error", text: "Veuillez entrer votre mot de passe actuel" })
        return
      }

      if (userSettings.newPassword !== userSettings.confirmPassword) {
        setSettingsMessage({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas" })
        return
      }

      if (userSettings.newPassword.length < 6) {
        setSettingsMessage({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 6 caractères" })
        return
      }
    }

    setUpdating(true)
    setSettingsMessage({ type: "info", text: "Mise à jour en cours..." })

    // Préparer les données à envoyer
    const updateData = {
      firstName: userSettings.firstName,
      lastName: userSettings.lastName,
      email: userSettings.email,
      phone: userSettings.phone,
      department: userSettings.department,
      ...(changingPassword && { 
        currentPassword: userSettings.currentPassword,
        newPassword: userSettings.newPassword 
      })
    }

    // Simulation d'appel API (à remplacer par votre vrai appel)
    setTimeout(() => {
      // Sauvegarder dans localStorage pour la démo
      localStorage.setItem('userFirstName', userSettings.firstName)
      localStorage.setItem('userLastName', userSettings.lastName)
      localStorage.setItem('userPhone', userSettings.phone)
      localStorage.setItem('userDepartment', userSettings.department)
      
      // Mettre à jour l'email si changé
      if (userSettings.email !== userEmail) {
        localStorage.setItem('userEmail', userSettings.email)
        setUserEmail(userSettings.email)
        setUserName(userSettings.firstName || userSettings.email.split('@')[0])
      } else {
        setUserName(userSettings.firstName || userName)
      }
      
      setSettingsMessage({ type: "success", text: "Profil mis à jour avec succès !" })
      
      setTimeout(() => {
        handleCloseSettings()
      }, 2000)
      
      setUpdating(false)
    }, 1500)

    // Version avec vrai appel API (à décommenter quand votre backend est prêt)
    /*
    const result = await authService.updateProfile(updateData)

    if (result.success) {
      setSettingsMessage({ type: "success", text: result.message })
      
      if (userSettings.email !== userEmail) {
        setUserEmail(userSettings.email)
        setUserName(userSettings.firstName || userSettings.email.split('@')[0])
      } else {
        setUserName(userSettings.firstName || userName)
      }
      
      setTimeout(() => handleCloseSettings(), 2000)
    } else {
      setSettingsMessage({ type: "error", text: result.message })
      setUpdating(false)
    }
    */
  }

  // Fonction pour ajouter un compte créé comme nouveau module
  const handleAccountCreated = (newUser) => {
    const moduleId = `custom_${Date.now()}`
    const colorIndex = customModules.length % moduleColors.length
    
    const newModule = {
      id: moduleId,
      name: newUser.firstName || newUser.name || 'Nouveau compte',
      icon: getModuleIcon(newUser.role),
      color: moduleColors[colorIndex],
      count: 0,
      active: true,
      type: 'custom',
      createdBy: newUser
    }
    
    setCustomModules([...customModules, newModule])
    console.log("Nouveau compte créé:", newModule)
  }

  // Fonction pour obtenir une icône selon le rôle
  const getModuleIcon = (role) => {
    const icons = {
      'admin': '👑',
      'manager': '👔',
      'user': '👤',
      'comptable': '📊',
      'commercial': '📈',
      'default': '📁'
    }
    return icons[role] || icons.default
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{...styles.sidebar, width: sidebarCollapsed ? '80px' : '280px'}}>
        {/* En-tête avec toggle */}
        <div style={styles.sidebarHeader}>
          {!sidebarCollapsed && (
            <div style={styles.logoContainer}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#667eea"/>
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <div>
                <h1 style={styles.logoTitle}>ERP</h1>
                <p style={styles.logoSubtitle}>Administration</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={styles.logoCollapsed}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#667eea"/>
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={styles.toggleButton}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Profil utilisateur avec informations mises à jour */}
        {!sidebarCollapsed && (
          <div style={styles.profileSection}>
            <div style={styles.avatar}>
              {userSettings.firstName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>
                {userSettings.firstName} {userSettings.lastName}
              </div>
              <div style={styles.userEmail}>{userSettings.email}</div>
              {userSettings.department && (
                <div style={styles.userDepartment}>{userSettings.department}</div>
              )}
            </div>
          </div>
        )}

        {sidebarCollapsed && (
          <div style={styles.avatarCollapsed}>
            {userSettings.firstName?.charAt(0).toUpperCase() || "A"}
          </div>
        )}

        {/* Navigation */}
        <div style={styles.navContainer}>
          <p style={!sidebarCollapsed ? styles.navTitle : styles.navTitleCollapsed}>
            {!sidebarCollapsed ? "MENU" : "M"}
          </p>
          
          {/* Bouton Filtre des modules */}
          <div style={styles.filterButtonContainer}>
            <button
              onClick={() => setShowModuleFilter(!showModuleFilter)}
              style={{
                ...styles.navButton,
                background: showModuleFilter ? '#805ad5' : '#9f7aea',
                color: 'white',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                padding: sidebarCollapsed ? '12px' : '12px 20px',
                marginBottom: showModuleFilter ? '5px' : '10px',
                borderBottomLeftRadius: showModuleFilter && !sidebarCollapsed ? '0' : '10px',
                borderBottomRightRadius: showModuleFilter && !sidebarCollapsed ? '0' : '10px'
              }}
              onMouseEnter={(e) => {
                if (!showModuleFilter) e.target.style.background = '#805ad5'
              }}
              onMouseLeave={(e) => {
                if (!showModuleFilter) e.target.style.background = '#9f7aea'
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>🔍</span>
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>Filtre des modules</span>
                  <span style={styles.filterBadge}>
                    {activeModulesCount}/{allModules.length}
                  </span>
                </>
              )}
            </button>

            {/* Liste déroulante des modules */}
            {showModuleFilter && !sidebarCollapsed && (
              <div style={styles.modulesList}>
                {baseModules.map(module => (
                  <div key={module.id} style={styles.moduleItem}>
                    <div style={styles.moduleInfo}>
                      <span style={{ fontSize: '1.1rem', marginRight: '8px' }}>{module.icon}</span>
                      <span style={styles.moduleName}>{module.name}</span>
                      <span style={styles.moduleCount}>{module.count}</span>
                    </div>
                    <button
                      onClick={() => toggleModule(module.id)}
                      style={{
                        ...styles.toggleButton,
                        backgroundColor: module.active ? '#48bb78' : '#f56565'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = module.active ? '#38a169' : '#c53030'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = module.active ? '#48bb78' : '#f56565'
                      }}
                    >
                      {module.active ? 'Actif' : 'Inactif'}
                    </button>
                  </div>
                ))}

                {customModules.map(module => (
                  <div key={module.id} style={styles.moduleItem}>
                    <div style={styles.moduleInfo}>
                      <span style={{ fontSize: '1.1rem', marginRight: '8px' }}>{module.icon}</span>
                      <span style={styles.moduleName}>{module.name}</span>
                    </div>
                    <button
                      onClick={() => toggleModule(module.id)}
                      style={{
                        ...styles.toggleButton,
                        backgroundColor: module.active ? '#48bb78' : '#f56565'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = module.active ? '#38a169' : '#c53030'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = module.active ? '#48bb78' : '#f56565'
                      }}
                    >
                      {module.active ? 'Actif' : 'Inactif'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bouton Créer un compte */}
          <button
            onClick={() => setShowCreateAccount(true)}
            style={{
              ...styles.navButton,
              background: '#48bb78',
              color: 'white',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px' : '12px 20px',
              marginBottom: '10px',
              marginTop: showModuleFilter ? '5px' : '0'
            }}
            onMouseEnter={(e) => e.target.style.background = '#38a169'}
            onMouseLeave={(e) => e.target.style.background = '#48bb78'}
          >
            <span style={{ fontSize: "1.2rem" }}>➕</span>
            {!sidebarCollapsed && "Créer un compte"}
          </button>

          {/* Bouton Paramètres */}
          <button
            onClick={handleSettingsClick}
            style={{
              ...styles.navButton,
              background: '#4a5568',
              color: 'white',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px' : '12px 20px'
            }}
            onMouseEnter={(e) => e.target.style.background = '#2d3748'}
            onMouseLeave={(e) => e.target.style.background = '#4a5568'}
          >
            <span style={{ fontSize: "1.2rem" }}>⚙️</span>
            {!sidebarCollapsed && "Paramètres"}
          </button>
        </div>

        {/* Déconnexion */}
        <div style={styles.logoutSection}>
          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutButton,
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px' : '12px 20px'
            }}
            onMouseEnter={(e) => e.target.style.background = '#c53030'}
            onMouseLeave={(e) => e.target.style.background = '#f56565'}
          >
            <span style={{ fontSize: "1.2rem" }}>🚪</span>
            {!sidebarCollapsed && "Déconnexion"}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={{...styles.mainContent, marginLeft: sidebarCollapsed ? '80px' : '280px'}}>
        {/* Header avec recherche et indicateur de filtres */}
        <div style={styles.mainHeader}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Bonjour, <span style={{ color: '#667eea' }}>{userSettings.firstName || userName}</span> 👋
            </h1>
            {activeModulesCount < allModules.length && (
              <p style={styles.filterIndicator}>
                <span style={styles.filterDot}>•</span>
                {allModules.length - activeModulesCount} module(s) masqué(s)
              </p>
            )}
          </div>
          
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher une page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} style={styles.clearButton}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Résultats de recherche */}
        {searchTerm && (
          <div style={styles.searchResults}>
            <p style={styles.resultsCount}>
              {filteredPages.length} résultat{filteredPages.length > 1 ? 's' : ''}
            </p>
            <div style={styles.resultsList}>
              {filteredPages.map(page => (
                <div
                  key={page.id}
                  onClick={() => {
                    if (page.action === 'settings') handleSettingsClick()
                    else if (page.action === 'create') setShowCreateAccount(true)
                    else navigate(page.path)
                  }}
                  style={{
                    ...styles.resultItem, 
                    backgroundColor: page.color, 
                    opacity: page.module && !allModules.find(m => m.id === page.module)?.active ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  <span>{page.icon}</span>
                  {page.name}
                  {page.module && !allModules.find(m => m.id === page.module)?.active && (
                    <span style={styles.hiddenBadge}>Masqué</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grille des modules */}
        <div style={styles.modulesGrid}>
          {baseModules.filter(m => m.active).map(module => (
            <div key={module.id} style={styles.moduleCard}>
              <div style={{...styles.moduleIcon, backgroundColor: module.color}}>
                <span style={{ fontSize: '2rem' }}>{module.icon}</span>
              </div>
              <h3 style={styles.moduleTitle}>{module.name}</h3>
              <p style={styles.moduleStats}>{module.count} actions récentes</p>
              <div style={styles.moduleActions}>
                <button 
                  onClick={() => navigate(`/${module.id}/dashboard`)}
                  style={styles.moduleButton}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate(`/${module.id}`)}
                  style={styles.moduleButtonSecondary}
                >
                  Gestion
                </button>
              </div>
            </div>
          ))}

          {customModules.filter(m => m.active).map(module => (
            <div key={module.id} style={styles.moduleCard}>
              <div style={{...styles.moduleIcon, backgroundColor: module.color}}>
                <span style={{ fontSize: '2rem' }}>{module.icon}</span>
              </div>
              <h3 style={styles.moduleTitle}>{module.name}</h3>
              <p style={styles.moduleStats}> </p>
              <div style={styles.moduleActions}>
                <button 
                  onClick={() => navigate(`/${module.id}/dashboard`)}
                  style={styles.moduleButton}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate(`/${module.id}`)}
                  style={styles.moduleButtonSecondary}
                >
                  Gestion
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun module actif */}
        {allModules.filter(m => m.active).length === 0 && (
          <div style={styles.noActiveModules}>
            <p>Aucun module actif. Utilisez le filtre dans la sidebar pour activer des modules.</p>
          </div>
        )}
      </div>

      {/* Modale de création de compte */}
      {showCreateAccount && (
        <CreateAccount 
          onClose={() => setShowCreateAccount(false)}
          onAccountCreated={handleAccountCreated}
        />
      )}

      {/* Modale de paramètres améliorée */}
      {showSettings && (
        <div style={styles.modalOverlay} onClick={handleCloseSettings}>
          <div style={{...styles.modalContent, width: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <span>⚙️</span> Paramètres du profil
              </h2>
              <button onClick={handleCloseSettings} style={styles.closeButton}>✕</button>
            </div>

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

            <div style={styles.settingsForm}>
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
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userSettings.phone}
                      onChange={handleSettingsChange}
                      style={styles.input}
                      placeholder="+33 6 12 34 56 78"
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
                      onChange={handleSettingsChange}
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
            </div>

            <div style={styles.modalActions}>
              <button onClick={handleCloseSettings} style={styles.cancelButton}>
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
          </div>
        </div>
      )}
    </div>
  )
}

// Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f7fafc"
  },
  sidebar: {
    background: "white",
    boxShadow: "4px 0 20px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    transition: "width 0.3s ease"
  },
  sidebarHeader: {
    padding: "24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  logoTitle: {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "#1a202c",
    margin: 0
  },
  logoSubtitle: {
    fontSize: "0.8rem",
    color: "#718096",
    margin: 0
  },
  logoCollapsed: {
    display: "flex",
    justifyContent: "center",
    width: "100%"
  },
  toggleButton: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    cursor: "pointer",
    color: "#a0aec0",
    padding: "4px 8px",
    borderRadius: "4px"
  },
  profileSection: {
    padding: "24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    fontWeight: 700
  },
  avatarCollapsed: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: 700,
    margin: "20px auto"
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontWeight: 700,
    color: "#1a202c"
  },
  userEmail: {
    color: "#718096",
    fontSize: "0.85rem"
  },
  userDepartment: {
    color: "#a0aec0",
    fontSize: "0.75rem",
    marginTop: "2px"
  },
  navContainer: {
    padding: "24px",
    flex: 1
  },
  navTitle: {
    fontSize: "0.7rem",
    textTransform: "uppercase",
    color: "#a0aec0",
    marginBottom: "16px",
    fontWeight: 600,
    letterSpacing: "0.5px"
  },
  navTitleCollapsed: {
    fontSize: "0.7rem",
    textTransform: "uppercase",
    color: "#a0aec0",
    marginBottom: "16px",
    fontWeight: 600,
    textAlign: "center"
  },
  navButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    marginBottom: "8px",
    transition: "all 0.3s",
    background: "transparent"
  },
  filterButtonContainer: {
    position: "relative",
    width: "100%",
    marginBottom: "5px"
  },
  filterBadge: {
    background: "rgba(255,255,255,0.2)",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 600
  },
  modulesList: {
    background: "white",
    borderRadius: "0 0 10px 10px",
    border: "1px solid #e2e8f0",
    borderTop: "none",
    marginBottom: "10px",
    overflow: "hidden",
    animation: "slideDown 0.3s ease"
  },
  moduleItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    transition: "background 0.2s"
  },
  moduleInfo: {
    display: "flex",
    alignItems: "center",
    flex: 1
  },
  moduleName: {
    fontSize: "0.95rem",
    color: "#2d3748",
    fontWeight: 500,
    marginRight: "8px"
  },
  moduleCount: {
    background: "#e2e8f0",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "0.75rem",
    color: "#4a5568"
  },
  toggleButton: {
    padding: "4px 12px",
    color: "white",
    border: "none",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s",
    minWidth: "60px"
  },
  logoutSection: {
    padding: "24px",
    borderTop: "1px solid #e2e8f0"
  },
  logoutButton: {
    padding: "12px 20px",
    background: "#f56565",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.3s"
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    background: "#f7fafc",
    transition: "margin-left 0.3s ease"
  },
  mainHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "20px"
  },
  welcomeTitle: {
    fontSize: "2rem",
    margin: "0 0 5px 0",
    color: "#1a202c"
  },
  filterIndicator: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#718096",
    display: "flex",
    alignItems: "center"
  },
  filterDot: {
    color: "#f56565",
    fontSize: "1.2rem",
    marginRight: "5px"
  },
  searchContainer: {
    background: "white",
    borderRadius: "50px",
    padding: "4px 20px",
    display: "flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    width: "350px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  },
  searchIcon: {
    color: "#a0aec0",
    marginRight: "10px"
  },
  searchInput: {
    width: "100%",
    padding: "12px 0",
    border: "none",
    background: "transparent",
    fontSize: "0.95rem",
    outline: "none"
  },
  clearButton: {
    background: "none",
    border: "none",
    color: "#a0aec0",
    cursor: "pointer",
    fontSize: "1.2rem"
  },
  searchResults: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },
  resultsCount: {
    color: "#718096",
    fontSize: "0.9rem",
    marginBottom: "16px"
  },
  resultsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },
  resultItem: {
    color: "white",
    padding: "10px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "all 0.3s",
    position: "relative"
  },
  hiddenBadge: {
    background: "rgba(0,0,0,0.2)",
    padding: "2px 6px",
    borderRadius: "10px",
    fontSize: "0.7rem",
    marginLeft: "5px"
  },
  modulesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px"
  },
  moduleCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    transition: "all 0.3s",
    cursor: "pointer"
  },
  moduleIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px"
  },
  moduleTitle: {
    fontSize: "1.3rem",
    margin: "0 0 8px 0",
    color: "#1a202c"
  },
  moduleStats: {
    color: "#718096",
    fontSize: "0.9rem",
    marginBottom: "16px",
    minHeight: "20px"
  },
  moduleActions: {
    display: "flex",
    gap: "12px"
  },
  moduleButton: {
    padding: "8px 16px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    flex: 1
  },
  moduleButtonSecondary: {
    padding: "8px 16px",
    background: "white",
    color: "#4a5568",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    flex: 1
  },
  noActiveModules: {
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
    color: "#718096",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea, #764ba2)"
  },
  spinner: {
    width: "60px",
    height: "60px",
    border: "4px solid rgba(255,255,255,0.2)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 0.8s linear infinite"
  },
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
    width: "400px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  modalTitle: {
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
    color: "#a0aec0"
  },
  messageBox: {
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid"
  },
  settingsForm: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
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
  }
}

// Ajout de l'animation
const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`
document.head.appendChild(styleSheet)

export default Admin