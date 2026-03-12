// src/pages/dashboard/facturation/FacturationAdmin.jsx - VERSION CORRIGÉE
import { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { clearAuth, getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"
import { customerService } from "../../services/clientService" // ✅ export const
import { orderService } from "../../services/orderService" // ✅ export const
import { invoiceService } from "../../services/invoiceService" // ✅ export const
import { reportService } from "../../services/reportService" // ✅ export const
import userService from "../../services/userService" // ✅ CORRIGÉ (sans accolades)
import "./FacturationAdmin.css"
// ===== CONSTANTES =====
const C = {
  DATE_OPTIONS: { weekday:'long', day:'numeric', month:'long', year:'numeric' },
  STATUS: { payée:"#10b981","en attente":"#f59e0b",envoyée:"#3b82f6",brouillon:"#6b7280","en retard":"#ef4444",livrée:"#10b981",expédiée:"#3b82f6","en préparation":"#8b5cf6",confirmée:"#8b5cf6","non payée":"#ef4444",actif:"#10b981",inactif:"#6b7280",archivée:"#6b7280" },
  STATUS_BG: { payée:"#d1fae5","en attente":"#fef3c7",envoyée:"#dbeafe",brouillon:"#f3f4f6","en retard":"#fee2e2",livrée:"#d1fae5",expédiée:"#dbeafe","en préparation":"#ede9fe",confirmée:"#ede9fe","non payée":"#fee2e2",actif:"#d1fae5",inactif:"#f3f4f6",archivée:"#e5e7eb" },
  ORDER_STATUSES: ["en attente","confirmée","en préparation","expédiée","livrée"],
  PAYMENT_STATUSES: ["non payée","en attente","payée"],
  CLIENT_STATUSES: ["actif","inactif"],
  REPORT_TYPES: ["financier","clients","commandes","analytique"],
  ARCHIVE_REASONS: ["Période fiscale clôturée", "Exercice comptable terminé", "Facture soldée", "Archivage manuel"],
  TABS: { ORDERS:"orders", CLIENTS:"clients", INVOICES:"invoices", REPORTS:"reports", ARCHIVE:"archive", SETTINGS:"settings" }
}

// 🔌 SUPPRIMER LES DONNÉES DE DÉMONSTRATION
// const DATA = { ... } ← À SUPPRIMER

// ===== FONCTIONS UTILITAIRES =====
const utils = {
  formatCurrency: a => a.toLocaleString('fr-FR',{style:'currency',currency:'EUR'}),
  formatDate: d => d?new Date(d).toLocaleDateString('fr-FR'):"",
  generateId: (p,items) => `${p}-${String(Math.max(...items.map(i=>+i.id.split('-').pop()||0),0)+1).padStart(3,'0')}`,
  updateClientStats: (c,n,t,op='add') => c.map(c=>c.name===n?{...c,totalOrders:Math.max(0,c.totalOrders+(op==='add'?1:-1)),totalSpent:Math.max(0,c.totalSpent+(op==='add'?t:-t)),lastOrder:op==='add'?new Date().toISOString().split('T')[0]:c.lastOrder}:c),
  generateArchiveRef: () => `ARCH-${new Date().getFullYear()}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`,
  calculateRetentionDate: (date,years=10) => {const d=new Date(date);d.setFullYear(d.getFullYear()+years);return d.toISOString().split('T')[0];}
}

// ===== COMPOSANTS RÉUTILISABLES =====
const StatusBadge = ({status}) => (
  <span className="status-badge" style={{background:C.STATUS_BG[status]||"#f3f4f6",color:C.STATUS[status]||"#6b7280"}}>{status}</span>
)

const Table = ({h,r,rn}) => (
  <div className="table-container"><table className="data-table"><thead><tr>{h.map((v,i)=><th key={i}>{v}</th>)}</tr></thead><tbody>{r.map(rn)}</tbody></table></div>
)

const SearchBar = ({v,o,p}) => (
  <div className="search-box large"><span className="search-icon">🔍</span><input type="text" placeholder={p} className="search-input" value={v} onChange={e=>o(e.target.value)}/></div>
)

const useNotification = () => {
  const [n,setN] = useState({show:false,message:"",type:""})
  const show = useCallback((m,t)=>{setN({show:true,message:m,type:t});setTimeout(()=>setN({show:false,message:"",type:""}),3000)},[])
  return {notification:n,showNotification:show}
}

// ===== COMPOSANT PRINCIPAL =====
export default function FacturationAdmin() {
  const nav = useNavigate()
  
  // ===== ÉTATS =====
  const [email,setEmail] = useState("")
  const [userRole,setUserRole] = useState("")
  const [loading,setLoading] = useState(true)
  const [userSettings, setUserSettings] = useState({ firstName:'', lastName:'', email:'', phone:'', department:'', role:'', currentPassword:'', newPassword:'', confirmPassword:'' })
  const [settingsMessage, setSettingsMessage] = useState({ type:"", text:"" })
  const [updating, setUpdating] = useState(false)
  const [tab,setTab] = useState(C.TABS.ORDERS)
  const [clients,setClients] = useState([])
  const [orders,setOrders] = useState([])
  const [invoices,setInvoices] = useState([])
  const [reports,setReports] = useState([])
  const [archiveLog,setArchiveLog] = useState([])
  const [showArchive,setShowArchive] = useState(false)
  const [archiveModal,setArchiveModal] = useState({show:false,invoice:null})
  const [archiveFilters,setArchiveFilters] = useState({search:"",year:"all"})
  const [modal,setModal] = useState({client:false,order:false,report:false})
  const [edit,setEdit] = useState({type:null,data:null})
  const [cForm,setCForm] = useState({name:"",email:"",phone:"",address:"",siret:"",status:"actif"})
  const [oForm,setOForm] = useState({client:"",items:"1",total:"",status:"en attente",paymentStatus:"non payée"})
  const [rForm,setRForm] = useState({title:"",description:"",type:"financier"})
  const [filters,setFilters] = useState({date:{start:"",end:""},search:""})
  const {notification,showNotification} = useNotification()
  const [dataLoading, setDataLoading] = useState(false)

  // ===== EFFETS =====
  useEffect(() => {
    const role = getUserRole()
    const e = getUserEmail()
    if (!isAuthenticated() || (role!=="admin_facture" && role!=="admin_principal")) nav("/login")
    else {
      setUserRole(role)
      setEmail(e)
      loadUserProfile()
      loadAllData()
      setLoading(false)
    }
  }, [nav])

  // 🔌 NOUVELLE FONCTION : Charger le profil utilisateur
  const loadUserProfile = async () => {
    try {
      const response = await userService.getProfile()
      if (response.success) {
        const userData = response.data
        setUserSettings({
          firstName: userData.firstName || "Gestionnaire",
          lastName: userData.lastName || "Facturation",
          email: userData.email || "",
          phone: userData.phone || "",
          department: userData.department || "Comptabilité",
          role: userData.role || "admin_facture",
          currentPassword: '', newPassword: '', confirmPassword: ''
        })
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error)
    }
  }

  // 🔌 NOUVELLE FONCTION : Charger toutes les données
  const loadAllData = async () => {
    setDataLoading(true)
    try {
      // Charger en parallèle pour optimiser
      const [clientsRes, ordersRes, invoicesRes, reportsRes] = await Promise.all([
        customerService.getAll(),
        orderService.getAll(),
        invoiceService.getAll(),
        reportService.getAll()
      ])

      if (clientsRes.success) setClients(clientsRes.data || [])
      if (ordersRes.success) setOrders(ordersRes.data || [])
      if (invoicesRes.success) setInvoices(invoicesRes.data || [])
      if (reportsRes.success) setReports(reportsRes.data || [])
      
      // 🔌 Charger l'archive log (à créer dans le backend)
      // const archiveRes = await invoiceService.getArchiveLog()
      // if (archiveRes.success) setArchiveLog(archiveRes.data || [])
      
    } catch (error) {
      console.error("Erreur chargement données:", error)
      showNotification("Erreur de chargement des données", "error")
    } finally {
      setDataLoading(false)
    }
  }

  // ===== STATISTIQUES =====
  const stats = useMemo(() => ({
    totalOrders:orders.length,totalInvoices:invoices.length,totalAmount:invoices.reduce((a,i)=>a+i.amount,0),
    paidAmount:invoices.filter(i=>i.status==="payée").reduce((a,i)=>a+i.amount,0),
    pendingAmount:invoices.filter(i=>["en attente","envoyée"].includes(i.status)).reduce((a,i)=>a+i.amount,0),
    overdueAmount:invoices.filter(i=>i.status==="en retard").reduce((a,i)=>a+i.amount,0),
    totalClients:clients.length,activeClients:clients.filter(c=>c.status==="actif").length,
    ordersToInvoice:orders.filter(o=>!o.invoiceId).length,paidInvoices:invoices.filter(i=>i.status==="payée").length,
    totalReports:reports.length,archivedInvoices:invoices.filter(i=>i.archived).length,totalArchiveEntries:archiveLog.length
  }),[orders,invoices,clients,reports,archiveLog])

  // ===== GESTION DES PARAMÈTRES =====
  const handleSettingsChange = (e) => {
    const { name, value } = e.target
    setUserSettings({ ...userSettings, [name]: value })
  }

  // 🔌 MODIFICATION : Sauvegarder les paramètres dans le backend
  const handleSaveSettings = async () => {
    if (!userSettings.firstName || !userSettings.lastName || !userSettings.email) {
      setSettingsMessage({ type: "error", text: "Prénom, nom et email sont requis" })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userSettings.email)) {
      setSettingsMessage({ type: "error", text: "Format d'email invalide" })
      return
    }

    if (userSettings.phone && !/^[0-9+\-\s]+$/.test(userSettings.phone)) {
      setSettingsMessage({ type: "error", text: "Format de téléphone invalide" })
      return
    }

    setUpdating(true)
    setSettingsMessage({ type: "info", text: "Mise à jour en cours..." })

    try {
      // Mise à jour du profil
      const response = await userService.updateProfile({
        firstName: userSettings.firstName,
        lastName: userSettings.lastName,
        email: userSettings.email,
        phone: userSettings.phone,
        department: userSettings.department
      })

      if (response.success) {
        // Changement de mot de passe si demandé
        if (userSettings.newPassword) {
          await userService.changePassword(
            userSettings.currentPassword,
            userSettings.newPassword
          )
        }

        setSettingsMessage({ type: "success", text: "Profil mis à jour avec succès !" })
        if (userSettings.email !== email) {
          localStorage.setItem('userEmail', userSettings.email)
          setEmail(userSettings.email)
        }
      }
    } catch (error) {
      setSettingsMessage({ type: "error", text: error.message || "Erreur lors de la mise à jour" })
    } finally {
      setTimeout(() => { 
        setSettingsMessage({ type:"", text:"" }); 
        setUpdating(false) 
      }, 2000)
    }
  }

  // ===== GESTION DES MODALES =====
  const openModal = (type,item=null) => {
    if(item) {
      setEdit({type,data:item})
      type==='client' ? setCForm(item) : 
      type==='order' ? setOForm({client:item.client, items:String(item.items), total:String(item.total), status:item.status, paymentStatus:item.paymentStatus}) : 
      setRForm({title:item.title, description:item.description, type:item.type})
    }
    setModal(p=>({...p,[type]:true}))
  }

  const closeModal = type => {
    setModal(p=>({...p,[type]:false}))
    setEdit({type:null,data:null})
    type==='client' ? setCForm({name:"",email:"",phone:"",address:"",siret:"",status:"actif"}) :
    type==='order' ? setOForm({client:"",items:"1",total:"",status:"en attente",paymentStatus:"non payée"}) :
    setRForm({title:"",description:"",type:"financier"})
  }

  // ===== CRUD CLIENTS =====
  // 🔌 MODIFICATION : Appels backend
  const handleAddClient = async () => { 
    if(!cForm.name.trim()) return; 
    try {
      const response = await customerService.create(cForm)
      if (response.success) {
        await loadAllData()
        closeModal('client')
        showNotification("Client ajouté","success")
      }
    } catch (error) {
      showNotification("Erreur lors de l'ajout","error")
    }
  }

  const handleUpdateClient = async () => { 
    if(!cForm.name.trim()) return; 
    try {
      const response = await customerService.update(edit.data.id, cForm)
      if (response.success) {
        await loadAllData()
        closeModal('client')
        showNotification("Client modifié","success")
      }
    } catch (error) {
      showNotification("Erreur lors de la modification","error")
    }
  }

  const handleDeleteClient = async (id,name) => { 
    if(orders.filter(o=>o.client===name).length) {
      if(!window.confirm("Ce client a des commandes. Supprimer ?")) return
    } else {
      if(!window.confirm("Supprimer ce client ?")) return
    }
    try {
      const response = await customerService.delete(id)
      if (response.success) {
        await loadAllData()
        showNotification("Client supprimé","warning")
      }
    } catch (error) {
      showNotification("Erreur lors de la suppression","error")
    }
  }

  // ===== CRUD COMMANDES =====
  // 🔌 MODIFICATION : Appels backend
  const handleAddOrder = async () => { 
    if(!oForm.client||!oForm.total) return
    try {
      const orderData = {
        client: oForm.client,
        items: parseInt(oForm.items) || 1,
        total: parseFloat(oForm.total),
        status: oForm.status,
        paymentStatus: oForm.paymentStatus
      }
      const response = await orderService.create(orderData)
      if (response.success) {
        await loadAllData()
        closeModal('order')
        showNotification("Commande créée","success")
      }
    } catch (error) {
      showNotification("Erreur lors de la création","error")
    }
  }

  const handleUpdateOrder = async () => { 
    if(!oForm.client||!oForm.total) return
    try {
      const orderData = {
        client: oForm.client,
        items: parseInt(oForm.items) || 1,
        total: parseFloat(oForm.total),
        status: oForm.status,
        paymentStatus: oForm.paymentStatus
      }
      const response = await orderService.update(edit.data.id, orderData)
      if (response.success) {
        await loadAllData()
        closeModal('order')
        showNotification("Commande modifiée","success")
      }
    } catch (error) {
      showNotification("Erreur lors de la modification","error")
    }
  }

  const handleDeleteOrder = async (id,client,total) => { 
    if(!window.confirm("Supprimer cette commande ?")) return
    try {
      const response = await orderService.delete(id)
      if (response.success) {
        await loadAllData()
        showNotification("Commande supprimée","warning")
      }
    } catch (error) {
      showNotification("Erreur lors de la suppression","error")
    }
  }

  // ===== CRUD RAPPORTS =====
  // 🔌 MODIFICATION : Appels backend
  const handleAddReport = async () => { 
    if(!rForm.title.trim()||!rForm.description.trim()) return
    try {
      const response = await reportService.create(rForm)
      if (response.success) {
        await loadAllData()
        closeModal('report')
        showNotification("Rapport ajouté","success")
      }
    } catch (error) {
      showNotification("Erreur lors de l'ajout","error")
    }
  }

  const handleUpdateReport = async () => { 
    if(!rForm.title.trim()||!rForm.description.trim()) return
    try {
      const response = await reportService.update(edit.data.id, rForm)
      if (response.success) {
        await loadAllData()
        closeModal('report')
        showNotification("Rapport modifié","success")
      }
    } catch (error) {
      showNotification("Erreur lors de la modification","error")
    }
  }

  const handleDeleteReport = async (id,title) => { 
    if(!window.confirm(`Supprimer le rapport "${title}" ?`)) return
    try {
      const response = await reportService.delete(id)
      if (response.success) {
        await loadAllData()
        showNotification("Rapport supprimé","warning")
      }
    } catch (error) {
      showNotification("Erreur lors de la suppression","error")
    }
  }

  const handleViewReport = async (r) => {
    try {
      // 🔌 Télécharger le rapport en PDF
      await reportService.download(r.id, r.title)
    } catch (error) {
      showNotification("Erreur lors du téléchargement", "error")
    }
  }

  // ===== GESTION DES FACTURES =====
  // 🔌 MODIFICATION : Appels backend
  const handleGenerateInvoice = async (order) => { 
    if(order.invoiceId) { 
      alert("Facture déjà associée !") 
      return 
    }
    try {
      const invoiceData = {
        orderId: order.id,
        client: order.client,
        amount: order.total,
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
      }
      const response = await invoiceService.create(invoiceData)
      if (response.success) {
        await loadAllData()
        showNotification(`Facture générée avec succès`,"success")
      }
    } catch (error) {
      showNotification("Erreur lors de la génération","error")
    }
  }

  const handleMarkAsPaid = async (id) => { 
    try {
      const response = await invoiceService.markAsPaid(id, {
        paymentMethod: "virement",
        amount: invoices.find(i => i.id === id)?.amount
      })
      if (response.success) {
        await loadAllData()
        showNotification("Facture marquée payée","success")
      }
    } catch (error) {
      showNotification("Erreur lors du marquage","error")
    }
  }

  const handleRestoreInvoice = async (invoiceId) => { 
    try {
      const response = await invoiceService.restore(invoiceId)
      if (response.success) {
        await loadAllData()
        showNotification(`Facture ${invoiceId} restaurée`,"success")
      }
    } catch (error) {
      showNotification("Erreur lors de la restauration","error")
    }
  }

  const handleArchiveInvoice = async (invoice,reason="Archivage manuel") => { 
    if(invoice.status!=="payée") { 
      showNotification("Seules les factures payées peuvent être archivées","error") 
      return 
    }
    try {
      const response = await invoiceService.archive(invoice.id, { reason })
      if (response.success) {
        await loadAllData()
        setArchiveModal({show:false,invoice:null})
        showNotification(`Facture ${invoice.id} archivée`,"success")
      }
    } catch (error) {
      showNotification("Erreur lors de l'archivage","error")
    }
  }

  // 🔌 AJOUT : Télécharger PDF facture
  const handleDownloadInvoice = async (id) => {
    try {
      await invoiceService.downloadPdf(id)
      showNotification("Téléchargement en cours...", "info")
    } catch (error) {
      showNotification("Erreur lors du téléchargement", "error")
    }
  }

  // ===== FILTRES =====
  const filteredOrders = useMemo(()=>orders.filter(o=>(!filters.date.start||o.date>=filters.date.start)&&(!filters.date.end||o.date<=filters.date.end)&&(!filters.search||o.id.toLowerCase().includes(filters.search.toLowerCase())||o.client.toLowerCase().includes(filters.search.toLowerCase()))),[orders,filters])
  const filteredClients = useMemo(()=>clients.filter(c=>!filters.search||c.name.toLowerCase().includes(filters.search.toLowerCase())||c.email.toLowerCase().includes(filters.search.toLowerCase())||c.siret.includes(filters.search)),[clients,filters.search])
  const filteredInvoices = useMemo(()=>invoices.filter(i=>(!filters.search||i.id.toLowerCase().includes(filters.search.toLowerCase())||i.client.toLowerCase().includes(filters.search.toLowerCase())||i.orderId.toLowerCase().includes(filters.search.toLowerCase()))&&(showArchive||!i.archived)).sort((a,b)=>new Date(b.date)-new Date(a.date)),[invoices,filters.search,showArchive])
  const filteredReports = useMemo(()=>reports.filter(r=>!filters.search||r.title.toLowerCase().includes(filters.search.toLowerCase())).sort((a,b)=>new Date(b.date)-new Date(a.date)),[reports,filters.search])
  const filteredArchiveLog = useMemo(()=>archiveLog.filter(e=>(!archiveFilters.search||e.invoiceId.toLowerCase().includes(archiveFilters.search.toLowerCase())||e.client?.toLowerCase().includes(archiveFilters.search.toLowerCase())||e.reference.toLowerCase().includes(archiveFilters.search.toLowerCase()))&&(archiveFilters.year==="all"||e.date.startsWith(archiveFilters.year))).sort((a,b)=>new Date(b.date)-new Date(a.date)),[archiveLog,archiveFilters])

  // ===== COMPOSANT INTERNE =====
  const NavItem = ({k,i,l,c}) => (
    <button className={`nav-item ${tab===k?"active":""}`} onClick={()=>{setTab(k); setFilters(p=>({...p,search:""})); setShowArchive(false)}}>
      <span className="nav-icon">{i}</span><span>{l}</span>{c!==undefined&&<span className="nav-count">{c}</span>}
    </button>
  )

  if(loading || dataLoading) return <div className="facture-loading"><div className="spinner"></div><p>Chargement...</p></div>

  // ===== RENDU PRINCIPAL =====
  return (
    <div className="facture-container">
      {notification.show&&<div className={`notification ${notification.type}`}>{notification.message}</div>}
      
      <div className="facture-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon"><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#f59e0b"/><path d="M8 16L12 20L20 12" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg></div>
            <div><h1>ERP FACTURE</h1><p>Gestion comptable</p></div>
          </div>
          <span className="role-badge">COMPTABLE</span>
        </div>

        <div className="user-profile">
          <div className="avatar">{userSettings.firstName?.charAt(0).toUpperCase() || "C"}</div>
          <div className="user-info">
            <div className="user-name">{userSettings.firstName} {userSettings.lastName}</div>
            <div className="user-email">{userSettings.email || "compta@erp.com"}</div>
            {userSettings.department && <div className="user-department" style={{fontSize:"0.7rem",color:"#a0aec0"}}>{userSettings.department}</div>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {userRole==='admin_principal' && <button className="router-button" onClick={()=>nav('/admin')} style={{background:'#f59e0b',color:'white',border:'none',borderRadius:'5px',padding:'8px 12px',margin:'0 15px 10px 15px',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',width:'calc(100% - 30px)'}}><span>🏠</span> Admin Principal</button>}
          <button className="nav-item" onClick={()=>nav("/facturation/dashboard")}><span className="nav-icon">📊</span><span>Dashboard Facturation</span></button>
          <NavItem k={C.TABS.ORDERS} i="📦" l="Commandes" c={stats.totalOrders} />
          <NavItem k={C.TABS.CLIENTS} i="👥" l="Clients" c={stats.totalClients} />
          <NavItem k={C.TABS.INVOICES} i="📄" l="Factures" c={stats.totalInvoices} />
          <NavItem k={C.TABS.REPORTS} i="📈" l="Rapports" c={stats.totalReports} />
          <button className={`nav-item ${tab===C.TABS.ARCHIVE?"active":""}`} onClick={()=>{setTab(C.TABS.ARCHIVE); setArchiveFilters({search:"",year:"all"})}}>
            <span className="nav-icon">📦</span><span>Archive comptable</span><span className="nav-count">{stats.archivedInvoices}</span>
          </button>
          <NavItem k={C.TABS.SETTINGS} i="⚙️" l="Paramètres" />
        </nav>

        <div className="sidebar-footer">
          <button onClick={()=>{clearAuth(); nav("/login")}} className="logout-btn"><span className="nav-icon">🚪</span><span>Déconnexion</span></button>
        </div>
      </div>

      <div className="facture-main">
        <div className="main-header">
          <div>
            <h1 className="welcome-title">Bonjour, <span style={{color:"#f59e0b"}}>{userSettings.firstName || "Comptable"}</span></h1>
            <p className="welcome-subtitle">
              {tab===C.TABS.ORDERS && "Gérez les commandes"}
              {tab===C.TABS.CLIENTS && "Gérez les clients"}
              {tab===C.TABS.INVOICES && "Gérez les factures"}
              {tab===C.TABS.REPORTS && "Créez et gérez vos rapports"}
              {tab===C.TABS.ARCHIVE && "Archive comptable professionnelle"}
              {tab===C.TABS.SETTINGS && "Modifiez vos informations personnelles"}
            </p>
          </div>
          <div className="header-actions">
            <div className="date-box"><span className="date-icon">📅</span>{new Date().toLocaleDateString('fr-FR',C.DATE_OPTIONS)}</div>
            {tab===C.TABS.ORDERS && tab!==C.TABS.SETTINGS && <button className="btn-primary" onClick={()=>openModal('order')}><span>+</span> Nouvelle commande</button>}
            {tab===C.TABS.CLIENTS && tab!==C.TABS.SETTINGS && <button className="btn-primary" onClick={()=>openModal('client')}><span>+</span> Nouveau client</button>}
            {tab===C.TABS.REPORTS && tab!==C.TABS.SETTINGS && <button className="btn-primary" onClick={()=>openModal('report')}><span>+</span> Nouveau rapport</button>}
          </div>
        </div>

        {tab===C.TABS.ORDERS && <div className="orders-content">
          <div className="content-header"><div className="header-left"><h2>📦 Commandes</h2><span className="header-count">{filteredOrders.length}</span></div></div>
          <div className="filters-bar">
            <SearchBar v={filters.search} o={v=>setFilters(p=>({...p,search:v}))} p="Rechercher par N° commande ou client..."/>
            <div className="filter-group"><div className="date-filter"><input type="date" value={filters.date.start} onChange={e=>setFilters(p=>({...p,date:{...p.date,start:e.target.value}}))}/><span>à</span><input type="date" value={filters.date.end} onChange={e=>setFilters(p=>({...p,date:{...p.date,end:e.target.value}}))}/></div></div>
          </div>
          <Table h={["N°","Date","Client","Art.","Total","Statut","Paiement","Facture","Actions"]} r={filteredOrders} rn={o=><tr key={o.id}><td className="order-number">{o.id}</td><td>{utils.formatDate(o.date)}</td><td className="client-name">{o.client}</td><td>{o.items}</td><td className="amount">{utils.formatCurrency(o.total)}</td><td><StatusBadge status={o.status}/></td><td><StatusBadge status={o.paymentStatus}/></td><td>{o.invoiceId?<span className="invoice-linked">✅ {o.invoiceId}</span>:<button className="btn-small btn-warning" onClick={()=>handleGenerateInvoice(o)}>Générer</button>}</td><td><div className="action-buttons"><button className="action-btn" onClick={()=>openModal('order',o)}>✏️</button><button className="action-btn" onClick={()=>handleDeleteOrder(o.id,o.client,o.total)}>🗑️</button></div></td></tr>}/>
        </div>}

        {tab===C.TABS.CLIENTS && <div className="clients-content">
          <div className="content-header"><div className="header-left"><h2>👥 Clients</h2><span className="header-count">{filteredClients.length}</span></div></div>
          <div className="search-section"><SearchBar v={filters.search} o={v=>setFilters(p=>({...p,search:v}))} p="Rechercher par nom, email ou SIRET..."/></div>
          <div className="clients-grid">{filteredClients.map(c=><div key={c.id} className="client-card"><div className="client-card-header"><div className="client-avatar">{c.name.charAt(0)}</div><div className="client-basic-info"><h4>{c.name}</h4><p className="client-siret">{c.siret}</p></div><StatusBadge status={c.status}/></div><div className="client-card-body"><div className="client-contact"><p><span>📧</span>{c.email}</p><p><span>📞</span>{c.phone}</p><p><span>📍</span>{c.address}</p></div><div className="client-stats"><div className="client-stat"><span>Cmd</span><strong>{c.totalOrders}</strong></div><div className="client-stat"><span>Total</span><strong>{utils.formatCurrency(c.totalSpent)}</strong></div><div className="client-stat"><span>Dernière</span><strong>{utils.formatDate(c.lastOrder)}</strong></div></div></div><div className="client-card-footer"><button className="btn-outline" onClick={()=>{setFilters(p=>({...p,search:c.name})); setTab(C.TABS.ORDERS)}}>Voir commandes</button><button className="btn-icon" onClick={()=>openModal('client',c)}>✏️</button><button className="btn-icon" onClick={()=>handleDeleteClient(c.id,c.name)}>🗑️</button></div></div>)}</div>
        </div>}

        {tab===C.TABS.INVOICES && <div className="invoices-content">
          <div className="content-header"><div className="header-left"><h2>📄 Factures</h2><span className="header-count">{filteredInvoices.length}</span></div></div>
          <div className="search-section"><SearchBar v={filters.search} o={v=>setFilters(p=>({...p,search:v}))} p="Rechercher par N° facture, client ou commande..."/></div>
          <Table h={["N°","Date","Commande","Client","Montant","Statut","Échéance","Archive","Actions"]} r={filteredInvoices} rn={i=><tr key={i.id} className={i.archived?"archived-row":""}><td className="invoice-number">{i.id}</td><td>{utils.formatDate(i.date)}</td><td className="order-id">{i.orderId}</td><td className="client-name">{i.client}</td><td className="amount">{utils.formatCurrency(i.amount)}</td><td><StatusBadge status={i.status}/></td><td className={new Date(i.dueDate)<new Date()&&i.status!=="payée"&&i.status!=="archivée"?"text-danger":""}>{utils.formatDate(i.dueDate)}{i.archived&&i.retentionDate&&<small className="retention-info">(Conservée jusqu'au {utils.formatDate(i.retentionDate)})</small>}</td><td>{i.archived?<span className="archived-badge" title={`Réf: ${i.archiveRef}`}>📦 Archivée{i.archiveRef&&<small>{i.archiveRef}</small>}</span>:i.status==="payée"&&<button className="btn-small btn-archive" onClick={()=>setArchiveModal({show:true,invoice:i})} title="Archiver">📦 Archiver</button>}</td><td><div className="action-buttons">{i.archived?<button className="action-btn" onClick={()=>handleRestoreInvoice(i.id)} title="Restaurer">↩️</button>:i.status!=="payée"&&<button className="action-btn success" onClick={()=>handleMarkAsPaid(i.id)} title="Marquer payée">💰</button>}<button className="action-btn" onClick={()=>handleDownloadInvoice(i.id)} title="Télécharger">📥</button></div></td></tr>}/>
        </div>}

        {tab===C.TABS.REPORTS && <div className="reports-content">
          <div className="content-header"><div className="header-left"><h2>📈 Rapports</h2><span className="header-count">{filteredReports.length}</span></div></div>
          <div className="search-section"><SearchBar v={filters.search} o={v=>setFilters(p=>({...p,search:v}))} p="Rechercher par titre..."/></div>
          <div className="reports-grid">{filteredReports.map(r=><div key={r.id} className="report-card detailed"><div className="report-card-header"><div className="report-icon-large">{r.type==='financier'&&'💰'}{r.type==='clients'&&'👥'}{r.type==='commandes'&&'📦'}{r.type==='analytique'&&'📊'}</div><div className="report-info"><h3>{r.title}</h3><p className="report-meta"><span className="report-type">{r.type}</span><span className="report-date">📅{utils.formatDate(r.date)}</span><span className="report-author">👤{r.author}</span></p></div></div><div className="report-card-body"><p className="report-description">{r.description}</p></div><div className="report-card-footer"><button className="btn-outline" onClick={()=>handleViewReport(r)}>👁️ Voir</button><button className="btn-icon" onClick={()=>openModal('report',r)}>✏️</button><button className="btn-icon" onClick={()=>handleDeleteReport(r.id,r.title)}>🗑️</button></div></div>)}</div>
        </div>}

        {tab===C.TABS.ARCHIVE && <div className="archive-content">
          <div className="archive-header"><h2>📦 Archive comptable</h2></div>
          <div className="archive-filters">
            <SearchBar v={archiveFilters.search} o={v=>setArchiveFilters({...archiveFilters,search:v})} p="Rechercher par facture, client ou référence..."/>
            <select className="archive-year-filter" value={archiveFilters.year} onChange={e=>setArchiveFilters({...archiveFilters,year:e.target.value})}>
              <option value="all">Toutes les années</option>
              {[...new Set(archiveLog.map(e=>e.date.substring(0,4)))].sort().reverse().map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="archive-log">
            <h3>Journal des archives</h3>
            <table className="archive-table">
              <thead><tr><th>Référence</th><th>Facture</th><th>Date</th><th>Client</th><th>Montant</th><th>Motif</th><th>Archivé par</th><th>Conservation</th><th>Actions</th></tr></thead>
              <tbody>{filteredArchiveLog.map(e=><tr key={e.id}><td><span className="archive-ref">{e.reference}</span></td><td>{e.invoiceId}</td><td>{utils.formatDate(e.date)}</td><td>{e.client||"-"}</td><td>{utils.formatCurrency(e.amount||0)}</td><td>{e.reason}</td><td>{e.archivedBy}</td><td>{utils.formatDate(e.retentionDate)}</td><td><button className="btn-icon" onClick={()=>handleRestoreInvoice(e.invoiceId)} title="Restaurer">↩️</button></td></tr>)}</tbody>
            </table>
          </div>
        </div>}

        {tab===C.TABS.SETTINGS && (
          <div className="settings-tab">
            <h2>⚙️ Paramètres du profil</h2>
            
            {settingsMessage.text && <div className={`settings-message ${settingsMessage.type}`}>{settingsMessage.text}</div>}

            <div className="settings-form">
              <div className="settings-section">
                <h3>Informations personnelles</h3>
                <div className="settings-row">
                  <div className="settings-group"><label>Prénom</label><input type="text" name="firstName" value={userSettings.firstName} onChange={handleSettingsChange} placeholder="Votre prénom"/></div>
                  <div className="settings-group"><label>Nom</label><input type="text" name="lastName" value={userSettings.lastName} onChange={handleSettingsChange} placeholder="Votre nom"/></div>
                </div>
                <div className="settings-row">
                  <div className="settings-group"><label>Email</label><input type="email" name="email" value={userSettings.email} onChange={handleSettingsChange} placeholder="votre@email.com"/></div>
                  <div className="settings-group"><label>Téléphone</label><input type="tel" name="phone" value={userSettings.phone} onChange={handleSettingsChange} placeholder=""/></div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Informations professionnelles</h3>
                <div className="settings-row">
                  <div className="settings-group"><label>Département</label><input type="text" name="department" value={userSettings.department} onChange={handleSettingsChange} placeholder="Votre département"/></div>
                  <div className="settings-group"><label>Rôle</label><input type="text" value={userSettings.role} disabled style={{backgroundColor:'#f7fafc',cursor:'not-allowed'}}/><small>Le rôle ne peut pas être modifié</small></div>
                </div>
              </div>

              <div className="settings-section">
                <h3>Changer le mot de passe</h3>
                <p className="settings-hint">Laissez vide si vous ne souhaitez pas changer votre mot de passe</p>
                <div className="settings-group"><label>Mot de passe actuel</label><input type="password" name="currentPassword" value={userSettings.currentPassword} onChange={handleSettingsChange} placeholder=""/></div>
                <div className="settings-row">
                  <div className="settings-group"><label>Nouveau mot de passe</label><input type="password" name="newPassword" value={userSettings.newPassword} onChange={handleSettingsChange} placeholder=""/></div>
                  <div className="settings-group"><label>Confirmer</label><input type="password" name="confirmPassword" value={userSettings.confirmPassword} onChange={handleSettingsChange} placeholder=""/></div>
                </div>
                <small>Minimum 6 caractères</small>
              </div>

              <div className="settings-actions">
                <button className="btn-primary" onClick={handleSaveSettings} disabled={updating} style={{width:'100%',background:"#f59e0b"}}>
                  {updating ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {archiveModal.show&&archiveModal.invoice&&<div className="modal-overlay" onClick={()=>setArchiveModal({show:false,invoice:null})}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>📦 Archiver la facture</h3><button className="modal-close" onClick={()=>setArchiveModal({show:false,invoice:null})}>×</button></div><div className="modal-body"><p>Vous êtes sur le point d'archiver :</p><div className="archive-invoice-info"><p><strong>Facture:</strong>{archiveModal.invoice.id}</p><p><strong>Client:</strong>{archiveModal.invoice.client}</p><p><strong>Montant:</strong>{utils.formatCurrency(archiveModal.invoice.amount)}</p><p><strong>Date:</strong>{utils.formatDate(archiveModal.invoice.date)}</p></div><p className="archive-warning">⚠️ L'archivage est irréversible.</p><div className="form-group"><label>Motif :</label><select id="archive-reason" onChange={(e)=>{const r=e.target.value; if(r&&window.confirm(`Confirmer l'archivage ?`)) handleArchiveInvoice(archiveModal.invoice,r)}} defaultValue=""><option value="" disabled>Sélectionner</option>{C.ARCHIVE_REASONS.map(r=><option key={r} value={r}>{r}</option>)}</select></div></div><div className="modal-footer"><button className="btn-secondary" onClick={()=>setArchiveModal({show:false,invoice:null})}>Annuler</button></div></div></div>}

      {modal.client&&<div className="modal-overlay" onClick={()=>closeModal('client')}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>{edit.type==='client'?'✏️ Modifier':'➕ Nouveau'} client</h3><button className="modal-close" onClick={()=>closeModal('client')}>×</button></div><div className="modal-body"><div className="form-group"><label>Nom *</label><input type="text" value={cForm.name} onChange={e=>setCForm({...cForm,name:e.target.value})}/></div><div className="form-row"><div className="form-group"><label>Email</label><input type="email" value={cForm.email} onChange={e=>setCForm({...cForm,email:e.target.value})}/></div><div className="form-group"><label>Tél</label><input type="tel" value={cForm.phone} onChange={e=>setCForm({...cForm,phone:e.target.value})}/></div></div><div className="form-group"><label>Adresse</label><input type="text" value={cForm.address} onChange={e=>setCForm({...cForm,address:e.target.value})}/></div><div className="form-row"><div className="form-group"><label>SIRET</label><input type="text" value={cForm.siret} onChange={e=>setCForm({...cForm,siret:e.target.value})}/></div><div className="form-group"><label>Statut</label><select value={cForm.status} onChange={e=>setCForm({...cForm,status:e.target.value})}>{C.CLIENT_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div></div></div><div className="modal-footer"><button className="btn-secondary" onClick={()=>closeModal('client')}>Annuler</button><button className="btn-primary" onClick={edit.type==='client'?handleUpdateClient:handleAddClient}>{edit.type==='client'?'Modifier':'Créer'}</button></div></div></div>}

      {modal.order&&<div className="modal-overlay" onClick={()=>closeModal('order')}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>{edit.type==='order'?'✏️ Modifier':'➕ Nouvelle'} commande</h3><button className="modal-close" onClick={()=>closeModal('order')}>×</button></div><div className="modal-body"><div className="form-group"><label>Client *</label><select value={oForm.client} onChange={e=>setOForm({...oForm,client:e.target.value})}><option value="">Sélectionner</option>{clients.filter(c=>c.status==="actif").map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div className="form-row"><div className="form-group"><label>Articles</label><input type="number" min="1" value={oForm.items} onChange={e=>setOForm({...oForm,items:e.target.value})}/></div><div className="form-group"><label>Total (€) *</label><input type="number" min="0" step="0.01" value={oForm.total} onChange={e=>setOForm({...oForm,total:e.target.value})}/></div></div><div className="form-row"><div className="form-group"><label>Statut cmd</label><select value={oForm.status} onChange={e=>setOForm({...oForm,status:e.target.value})}>{C.ORDER_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div><div className="form-group"><label>Paiement</label><select value={oForm.paymentStatus} onChange={e=>setOForm({...oForm,paymentStatus:e.target.value})}>{C.PAYMENT_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></div></div></div><div className="modal-footer"><button className="btn-secondary" onClick={()=>closeModal('order')}>Annuler</button><button className="btn-primary" onClick={edit.type==='order'?handleUpdateOrder:handleAddOrder}>{edit.type==='order'?'Modifier':'Créer'}</button></div></div></div>}

      {modal.report&&<div className="modal-overlay" onClick={()=>closeModal('report')}><div className="modal-content" onClick={e=>e.stopPropagation()}><div className="modal-header"><h3>{edit.type==='report'?'✏️ Modifier':'➕ Nouveau'} rapport</h3><button className="modal-close" onClick={()=>closeModal('report')}>×</button></div><div className="modal-body"><div className="form-group"><label>Titre *</label><input type="text" value={rForm.title} onChange={e=>setRForm({...rForm,title:e.target.value})} placeholder="Ex: Rapport financier mensuel"/></div><div className="form-group"><label>Description *</label><textarea value={rForm.description} onChange={e=>setRForm({...rForm,description:e.target.value})} placeholder="Description détaillée..." rows="4"/></div><div className="form-group"><label>Type</label><select value={rForm.type} onChange={e=>setRForm({...rForm,type:e.target.value})}>{C.REPORT_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div></div><div className="modal-footer"><button className="btn-secondary" onClick={()=>closeModal('report')}>Annuler</button><button className="btn-primary" onClick={edit.type==='report'?handleUpdateReport:handleAddReport} disabled={!rForm.title.trim()||!rForm.description.trim()}>{edit.type==='report'?'Modifier':'Créer'}</button></div></div></div>}
    </div>
  )
}