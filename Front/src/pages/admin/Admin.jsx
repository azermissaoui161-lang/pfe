// src/pages/admin/Admin.jsx - Version MongoDB
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"
import authService from "../../services/authService"
// 🔌 IMPORTS DES SERVICES

import { moduleService } from "../../services/moduleService" // 🔌 Service à créer
import CreateAccount from "../../components/forms/CreateAccount"
import AccountSettings from "../../components/forms/AccountSettings"
import userService from "../../services/userService"
import "./Admin.css"

function Admin() {
  const navigate = useNavigate()
  
  // ===== ÉTATS UTILISATEUR =====
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false) // 🔌 NOUVEAU
  const [updating, setUpdating] = useState(false)
  
  // ===== ÉTATS DE L'INTERFACE =====
  const [currentPage, setCurrentPage] = useState('accueil')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [moduleSearchTerm, setModuleSearchTerm] = useState("")
  
  // ===== ÉTATS DES PARAMÈTRES =====
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
  
  // ===== ÉTATS DES MODULES =====
  // 🔌 CHARGEMENT DEPUIS BACKEND
  const [baseModules, setBaseModules] = useState([])
  const [customModules, setCustomModules] = useState([])
  const [modulesLoading, setModulesLoading] = useState(false)

  // ===== CONSTANTES =====
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
  ]

  // ===== EFFET D'INITIALISATION =====
  useEffect(() => {
    const role = getUserRole()
    const email = getUserEmail()
    
    if (!isAuthenticated() || role !== "admin_principal") {
      navigate("/login")
    } else {
      setUserEmail(email)
      setUserName(email?.split('@')[0] || "Admin")
      
      loadUserProfile()
      loadModules() // 🔌 Charger les modules
      
      setLoading(false)
    }
  }, [navigate])

  // 🔌 NOUVELLE FONCTION : Charger le profil utilisateur
  const loadUserProfile = async () => {
    try {
      const response = await userService.getProfile()
      if (response.success) {
        const userData = response.data
        setUserSettings({
          firstName: userData.firstName || "Admin",
          lastName: userData.lastName || "",
          email: userData.email || userEmail,
          phone: userData.phone || "",
          department: userData.department || "Direction",
          role: userData.role || "admin_principal",
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error)
    }
  }

  // 🔌 NOUVELLE FONCTION : Charger les modules
  const loadModules = async () => {
    setModulesLoading(true)
    try {
      const [baseRes, customRes] = await Promise.all([
        moduleService.getBaseModules(),
        moduleService.getCustomModules()
      ])

      if (baseRes.success) setBaseModules(baseRes.data || [])
      if (customRes.success) setCustomModules(customRes.data || [])
      
    } catch (error) {
      console.error("Erreur chargement modules:", error)
    } finally {
      setModulesLoading(false)
    }
  }

  // ===== DONNÉES DÉRIVÉES =====
  const allModules = [...baseModules, ...customModules]
  
  const filteredModules = allModules.filter(module => 
    module.name.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
    module.category?.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
    module.type.toLowerCase().includes(moduleSearchTerm.toLowerCase())
  )

  const moduleStats = {
    total: allModules.length,
    actifs: allModules.filter(m => m.active).length,
    inactifs: allModules.filter(m => !m.active).length,
    bases: baseModules.length,
    personnalises: customModules.length
  }

  const activeModulesCount = allModules.filter(m => m.active).length

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

  const allPages = [...pages, ...getCustomPages()]

  const getFilteredPages = () => {
    return allPages.filter(page => {
      if (!page.module) return true
      const module = allModules.find(m => m.id === page.module)
      return module ? module.active : true
    })
  }

  const displayedPages = getFilteredPages()
  
  const filteredPages = displayedPages.filter(page => 
    page.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ===== FONCTIONS UTILITAIRES =====
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

  // ===== FONCTIONS DE GESTION DES MODULES =====
  // 🔌 MODIFICATION : Appels backend
  const toggleModule = async (moduleId) => {
    try {
      const module = allModules.find(m => m.id === moduleId)
      if (!module) return

      const response = await moduleService.toggleModule(moduleId, !module.active)
      
      if (response.success) {
        await loadModules() // Recharger les modules
      }
    } catch (error) {
      console.error("Erreur lors de la modification du module:", error)
    }
  }

  const toggleAllModules = async (activate) => {
    try {
      await Promise.all([
        ...baseModules.map(m => moduleService.toggleModule(m.id, activate)),
        ...customModules.map(m => moduleService.toggleModule(m.id, activate))
      ])
      await loadModules()
    } catch (error) {
      console.error("Erreur lors de la modification des modules:", error)
    }
  }

  // ===== FONCTIONS DE NAVIGATION =====
  const handleNavigation = (path) => navigate(path)
  
  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  const handleSettingsClick = () => {
    setCurrentPage('settings')
    setSettingsMessage({ type: "", text: "" })
  }

  const handleModulesClick = () => {
    setCurrentPage('modules')
    setModuleSearchTerm("")
  }

  const handleBackToAccueil = () => {
    setCurrentPage('accueil')
    setSettingsMessage({ type: "", text: "" })
    setUpdating(false)
    setModuleSearchTerm("")
  }

  // ===== FONCTIONS DE GESTION DES PARAMÈTRES =====
  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setUserSettings(prev => ({ ...prev, [name]: value }))
  }

  // 🔌 MODIFICATION : Sauvegarder dans le backend
  const handleSaveSettings = async () => {
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userSettings.email)) {
      setSettingsMessage({ type: "error", text: "Format d'email invalide" })
      return
    }

    if (userSettings.phone && !/^[0-9+\-\s]+$/.test(userSettings.phone)) {
      setSettingsMessage({ type: "error", text: "Format de téléphone invalide" })
      return
    }

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

    try {
      const response = await userService.updateProfile({
        firstName: userSettings.firstName,
        lastName: userSettings.lastName,
        email: userSettings.email,
        phone: userSettings.phone,
        department: userSettings.department
      })

      if (response.success) {
        if (userSettings.newPassword) {
          await userService.changePassword(userSettings.currentPassword, userSettings.newPassword)
        }

        localStorage.setItem('userFirstName', userSettings.firstName)
        localStorage.setItem('userLastName', userSettings.lastName)
        localStorage.setItem('userPhone', userSettings.phone)
        localStorage.setItem('userDepartment', userSettings.department)
        
        if (userSettings.email !== userEmail) {
          localStorage.setItem('userEmail', userSettings.email)
          setUserEmail(userSettings.email)
          setUserName(userSettings.firstName || userSettings.email.split('@')[0])
        } else {
          setUserName(userSettings.firstName || userName)
        }
        
        setSettingsMessage({ type: "success", text: "Profil mis à jour avec succès !" })
        setTimeout(() => setSettingsMessage({ type: "", text: "" }), 3000)
      }
    } catch (error) {
      setSettingsMessage({ type: "error", text: error.message || "Erreur lors de la mise à jour" })
    } finally {
      setUpdating(false)
    }
  }

  // ===== FONCTION DE CRÉATION DE COMPTE =====
  // 🔌 MODIFICATION : Créer dans le backend
  const handleAccountCreated = async (newUser) => {
    try {
      // Créer le module personnalisé
      const moduleData = {
        id: `custom_${Date.now()}`,
        name: newUser.firstName || newUser.name || 'Nouveau compte',
        icon: getModuleIcon(newUser.role),
        color: moduleColors[customModules.length % moduleColors.length],
        count: 0,
        active: true,
        type: 'custom',
        category: newUser.department || 'Général',
        createdBy: newUser.email,
        createdAt: new Date().toISOString().split('T')[0]
      }

      const response = await moduleService.createCustomModule(moduleData)
      
      if (response.success) {
        await loadModules()
        setTimeout(() => handleBackToAccueil(), 2000)
      }
    } catch (error) {
      console.error("Erreur lors de la création du module:", error)
    }
  }

  // ===== RENDU =====
  if (loading || modulesLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Sidebar (inchangée) */}
      <div style={{...styles.sidebar, width: sidebarCollapsed ? '80px' : '280px'}}>
        <div style={styles.sidebarHeader}>
          {!sidebarCollapsed && (
            <div style={styles.logoContainer} onClick={() => setCurrentPage('accueil')}>
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
            <div style={styles.logoCollapsed} onClick={() => setCurrentPage('accueil')}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#667eea"/>
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>

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

        <div style={styles.navContainer}>
          <p style={!sidebarCollapsed ? styles.navTitle : styles.navTitleCollapsed}>
            {!sidebarCollapsed ? "MENU" : "M"}
          </p>
          
          <button
            onClick={() => setCurrentPage('accueil')}
            style={{
              ...styles.navButton,
              background: currentPage === 'accueil' ? '#667eea' : 'transparent',
              color: currentPage === 'accueil' ? 'white' : '#4a5568',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px' : '12px 20px',
              marginBottom: '8px'
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🏠</span>
            {!sidebarCollapsed && "Page d'accueil"}
          </button>
          
          <button
            onClick={handleModulesClick}
            style={{
              ...styles.navButton,
              background: currentPage === 'modules' ? '#805ad5' : '#9f7aea',
              color: 'white',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px' : '12px 20px',
              marginBottom: '10px'
            }}
            onMouseEnter={(e) => currentPage !== 'modules' && (e.target.style.background = '#805ad5')}
            onMouseLeave={(e) => currentPage !== 'modules' && (e.target.style.background = '#9f7aea')}
          >
            <span style={{ fontSize: "1.2rem" }}>📊</span>
            {!sidebarCollapsed && (
              <>
                <span style={{ flex: 1, textAlign: 'left' }}>Gestion des modules</span>
                <span style={styles.filterBadge}>
                  {activeModulesCount}/{allModules.length}
                </span>
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentPage('createAccount')}
            style={{
              ...styles.navButton,
              background: currentPage === 'createAccount' ? '#38a169' : '#48bb78',
              color: 'white',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px' : '12px 20px',
              marginBottom: '10px'
            }}
            onMouseEnter={(e) => currentPage !== 'createAccount' && (e.target.style.background = '#38a169')}
            onMouseLeave={(e) => currentPage !== 'createAccount' && (e.target.style.background = '#48bb78')}
          >
            <span style={{ fontSize: "1.2rem" }}>➕</span>
            {!sidebarCollapsed && "Créer un compte"}
          </button>

          <button
            onClick={handleSettingsClick}
            style={{
              ...styles.navButton,
              background: currentPage === 'settings' ? '#2d3748' : '#4a5568',
              color: 'white',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              padding: sidebarCollapsed ? '12px' : '12px 20px'
            }}
            onMouseEnter={(e) => currentPage !== 'settings' && (e.target.style.background = '#2d3748')}
            onMouseLeave={(e) => currentPage !== 'settings' && (e.target.style.background = '#4a5568')}
          >
            <span style={{ fontSize: "1.2rem" }}>⚙️</span>
            {!sidebarCollapsed && "Paramètres"}
          </button>
        </div>

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

      {/* Main Content (inchangé) */}
      <div style={{...styles.mainContent, marginLeft: sidebarCollapsed ? '80px' : '280px'}}>
        {currentPage === 'accueil' && (
          <>
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

            {searchTerm && (
              <div style={styles.searchResults}>
                <p style={styles.resultsCount}>
                  {filteredPages.length} résultat{filteredPages.length > 1 ? 's' : ''}
                </p>
                <div style={styles.resultsList}>
                  {filteredPages.map(page => (
                    <div
                      key={page.id}
                      onClick={() => handleNavigation(page.path)}
                      style={{
                        ...styles.resultItem, 
                        backgroundColor: page.color, 
                        opacity: page.module && !allModules.find(m => m.id === page.module)?.active ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
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

            {allModules.filter(m => m.active).length === 0 && (
              <div style={styles.noActiveModules}>
                <p>Aucun module actif. Allez dans <strong>Gestion des modules</strong> pour activer des modules.</p>
              </div>
            )}
          </>
        )}

        {currentPage === 'modules' && (
          <div style={styles.pageContainer}>
            <h1 style={styles.pageTitle}>Gestion des modules</h1>
            
            <div style={styles.modulesStatsContainer}>
              <div style={styles.statCard}>
                <span style={styles.statCardValue}>{moduleStats.total}</span>
                <span style={styles.statCardLabel}>Total</span>
              </div>
              <div style={{...styles.statCard, background: '#48bb78'}}>
                <span style={styles.statCardValue}>{moduleStats.actifs}</span>
                <span style={styles.statCardLabel}>Actifs</span>
              </div>
              <div style={{...styles.statCard, background: '#f56565'}}>
                <span style={styles.statCardValue}>{moduleStats.inactifs}</span>
                <span style={styles.statCardLabel}>Inactifs</span>
              </div>
            </div>

            <div style={styles.modulesToolbar}>
              <div style={styles.modulesSearch}>
                <input
                  type="text"
                  placeholder="Rechercher module"
                  value={moduleSearchTerm}
                  onChange={(e) => setModuleSearchTerm(e.target.value)}
                  style={styles.modulesSearchInput}
                />
                {moduleSearchTerm && (
                  <button onClick={() => setModuleSearchTerm("")} style={styles.modulesClearButton}>
                    ✕
                  </button>
                )}
              </div>
              
              <div style={styles.modulesBulkActions}>
                <button onClick={() => toggleAllModules(true)} style={styles.modulesBulkButton}>
                  ✅ Tout activer
                </button>
                <button onClick={() => toggleAllModules(false)} style={styles.modulesBulkButton}>
                  ❌ Tout désactiver
                </button>
              </div>
            </div>

            <div style={styles.modulesTableWrapper}>
              <table style={styles.modulesTable}>
                <thead>
                  <tr>
                    <th style={styles.modulesTableHeader}>État</th>
                    <th style={styles.modulesTableHeader}>Icône</th>
                    <th style={styles.modulesTableHeader}>Nom</th>
                    <th style={styles.modulesTableHeader}>Catégorie</th>
                    <th style={styles.modulesTableHeader}>Type</th>
                    <th style={styles.modulesTableHeader}>Création</th>
                    <th style={styles.modulesTableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.length > 0 ? (
                    filteredModules.map(module => (
                      <tr key={module.id} style={styles.modulesTableRow}>
                        <td style={styles.modulesTableCell}>
                          <span style={{
                            ...styles.modulesStatusBadge,
                            backgroundColor: module.active ? '#48bb78' : '#f56565'
                          }}>
                            {module.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={styles.modulesTableCell}>
                          <span style={{ fontSize: '1.5rem' }}>{module.icon}</span>
                        </td>
                        <td style={styles.modulesTableCell}>
                          <div style={styles.modulesNameCell}>
                            <span style={styles.modulesNameText}>{module.name}</span>
                            {module.count > 0 && (
                              <span style={styles.modulesCountBadge}>{module.count}</span>
                            )}
                          </div>
                        </td>
                        <td style={styles.modulesTableCell}>
                          <span style={styles.modulesCategoryBadge}>
                            {module.category || 'Général'}
                          </span>
                        </td>
                        <td style={styles.modulesTableCell}>
                          <span style={{
                            ...styles.modulesTypeBadge,
                            backgroundColor: module.type === 'base' ? '#667eea' : '#9f7aea'
                          }}>
                            {module.type === 'base' ? 'Base' : 'Personnalisé'}
                          </span>
                        </td>
                        <td style={styles.modulesTableCell}>
                          <span style={styles.modulesDateText}>{module.createdAt || 'N/A'}</span>
                        </td>
                        <td style={styles.modulesTableCell}>
                          <button
                            onClick={() => toggleModule(module.id)}
                            style={{
                              ...styles.modulesActionButton,
                              backgroundColor: module.active ? '#f56565' : '#48bb78'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = module.active ? '#c53030' : '#38a169'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = module.active ? '#f56565' : '#48bb78'
                            }}
                          >
                            {module.active ? 'Désactiver' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={styles.modulesNoResults}>
                        Aucun module trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div style={styles.modulesTableFooter}>
              <span style={styles.modulesFooterText}>
                Affichage de {filteredModules.length} module(s) sur {allModules.length}
              </span>
            </div>
          </div>
        )}

        {currentPage === 'createAccount' && (
          <div style={styles.pageContainer}>
            <h1 style={styles.pageTitle}>Création de compte</h1>
            <CreateAccount 
              onClose={handleBackToAccueil}
              onAccountCreated={handleAccountCreated}
              standalone={true}
              onCancel={handleBackToAccueil}
            />
          </div>
        )}

        {currentPage === 'settings' && (
          <div style={styles.pageContainer}>
            <h1 style={styles.pageTitle}>Paramètres du profil</h1>
            <AccountSettings
              userSettings={userSettings}
              handleSettingsChange={handleSettingsChange}
              handleSaveSettings={handleSaveSettings}
              settingsMessage={settingsMessage}
              updating={updating}
              onClose={handleBackToAccueil}
              standalone={true}
              onCancel={handleBackToAccueil}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ===== STYLES (inchangés) =====
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
    gap: "12px",
    cursor: "pointer"
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
    width: "100%",
    cursor: "pointer"
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
    flex: 1,
    overflowY: "auto"
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
  filterBadge: {
    background: "rgba(255,255,255,0.2)",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: 600
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
  pageContainer: {
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
  },
  pageTitle: {
    fontSize: "1.8rem",
    color: "#1a202c",
    margin: "0 0 32px 0",
    textAlign: "center"
  },
  modulesStatsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "32px"
  },
  statCard: {
    background: "#4a5568",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  },
  statCardValue: {
    display: "block",
    fontSize: "2rem",
    fontWeight: 700,
    marginBottom: "4px"
  },
  statCardLabel: {
    fontSize: "0.9rem",
    opacity: 0.9
  },
  modulesToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap"
  },
  modulesSearch: {
    position: "relative",
    flex: 2,
    minWidth: "300px"
  },
  modulesSearchInput: {
    width: "100%",
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box"
  },
  modulesClearButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#a0aec0",
    cursor: "pointer",
    fontSize: "1rem"
  },
  modulesBulkActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  modulesBulkButton: {
    padding: "10px 16px",
    background: "#edf2f7",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#4a5568",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  modulesTableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "white"
  },
  modulesTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px"
  },
  modulesTableHeader: {
    padding: "16px",
    textAlign: "left",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#4a5568",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e2e8f0",
    background: "#f8fafc"
  },
  modulesTableRow: {
    transition: "background 0.3s",
    cursor: "pointer"
  },
  modulesTableCell: {
    padding: "16px",
    borderBottom: "1px solid #edf2f7",
    fontSize: "0.95rem"
  },
  modulesStatusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.8rem",
    fontWeight: 600,
    display: "inline-block"
  },
  modulesNameCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  modulesNameText: {
    fontWeight: 500,
    color: "#2d3748"
  },
  modulesCountBadge: {
    background: "#e2e8f0",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    color: "#4a5568"
  },
  modulesCategoryBadge: {
    background: "#e9d8fd",
    padding: "4px 10px",
    borderRadius: "16px",
    fontSize: "0.8rem",
    color: "#553c9a"
  },
  modulesTypeBadge: {
    padding: "4px 10px",
    borderRadius: "16px",
    fontSize: "0.8rem",
    color: "white",
    display: "inline-block"
  },
  modulesDateText: {
    color: "#718096",
    fontSize: "0.85rem"
  },
  modulesActionButton: {
    padding: "8px 16px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s"
  },
  modulesNoResults: {
    padding: "40px",
    textAlign: "center",
    color: "#a0aec0",
    fontSize: "0.95rem"
  },
  modulesTableFooter: {
    padding: "16px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "right",
    background: "#f8fafc",
    borderRadius: "0 0 8px 8px"
  },
  modulesFooterText: {
    fontSize: "0.85rem",
    color: "#718096"
  }
}

const styleSheet = document.createElement("style")
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .modulesTableRow:hover {
    background-color: #f7fafc;
  }
`
document.head.appendChild(styleSheet)

export default Admin