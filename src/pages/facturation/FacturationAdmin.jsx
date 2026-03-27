// src/pages/dashboard/facturation/FacturationAdmin.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { clearAuth, getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"
import "./FacturationAdmin.css"

function FacturationAdmin() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  
  // Modales
  const [showClientModal, setShowClientModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null)
  
  // Filtres
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })
  const [searchClient, setSearchClient] = useState("")
  const [filterStatus, setFilterStatus] = useState("tous")
  const [searchTerm, setSearchTerm] = useState("")

  // ===== DONNÉES =====
  
  // CLIENTS
  const [clients, setClients] = useState([
    { id: 1, name: "SARL Dupont", email: "contact@dupont.fr", phone: "01 23 45 67 89", address: "12 Rue de Paris, 75001 Paris", siret: "123 456 789 00012", totalOrders: 12, totalSpent: 15600.00, lastOrder: "2026-02-10", status: "actif" },
    { id: 2, name: "EURL Martin", email: "martin@eurl.fr", phone: "01 34 56 78 90", address: "45 Avenue des Champs, 69001 Lyon", siret: "234 567 890 00023", totalOrders: 5, totalSpent: 4250.50, lastOrder: "2026-02-11", status: "actif" },
    { id: 3, name: "SAS Tech", email: "factures@tech.fr", phone: "01 45 67 89 01", address: "78 Boulevard Voltaire, 31000 Toulouse", siret: "345 678 901 00034", totalOrders: 8, totalSpent: 18900.00, lastOrder: "2026-02-11", status: "actif" },
    { id: 4, name: "Boulangerie Paris", email: "compta@boulangerie.fr", phone: "01 56 78 90 12", address: "23 Rue du Four, 75006 Paris", siret: "456 789 012 00045", totalOrders: 3, totalSpent: 1350.00, lastOrder: "2026-02-12", status: "inactif" },
    { id: 5, name: "Restaurant Le Chef", email: "compta@lechef.fr", phone: "01 67 89 01 23", address: "56 Rue de la Table, 33000 Bordeaux", siret: "567 890 123 00056", totalOrders: 6, totalSpent: 8900.75, lastOrder: "2026-02-10", status: "actif" },
    { id: 6, name: "Garage Auto", email: "factures@garage.fr", phone: "01 78 90 12 34", address: "89 Rue de la Mécanique, 44000 Nantes", siret: "678 901 234 00067", totalOrders: 4, totalSpent: 3200.00, lastOrder: "2026-02-13", status: "actif" },
    { id: 7, name: "Cabinet Médical", email: "compta@medical.fr", phone: "01 89 01 23 45", address: "12 Avenue de la Santé, 13000 Marseille", siret: "789 012 345 00078", totalOrders: 7, totalSpent: 10500.00, lastOrder: "2026-02-13", status: "actif" },
    { id: 8, name: "École Privée", email: "facturation@ecole.fr", phone: "01 90 12 34 56", address: "34 Rue de l'Éducation, 59000 Lille", siret: "890 123 456 00089", totalOrders: 9, totalSpent: 28900.00, lastOrder: "2026-02-14", status: "actif" },
    { id: 9, name: "Pharmacie Centrale", email: "compta@pharmacie.fr", phone: "01 01 23 45 67", address: "56 Rue de la Santé, 67000 Strasbourg", siret: "901 234 567 00090", totalOrders: 11, totalSpent: 15670.00, lastOrder: "2026-02-14", status: "actif" },
    { id: 10, name: "Coiffure Moderne", email: "contact@coiffure.fr", phone: "01 12 34 56 78", address: "78 Rue de la Beauté, 06000 Nice", siret: "012 345 678 90101", totalOrders: 2, totalSpent: 1250.00, lastOrder: "2026-02-12", status: "inactif" },
  ])

  // COMMANDES
  const [orders, setOrders] = useState([
    { id: "CMD-2026-001", date: "2026-02-10", client: "SARL Dupont", items: 5, total: 1250.00, status: "livrée", paymentStatus: "payée", invoiceId: "FACT-2026-001" },
    { id: "CMD-2026-002", date: "2026-02-11", client: "EURL Martin", items: 3, total: 890.50, status: "expédiée", paymentStatus: "en attente", invoiceId: null },
    { id: "CMD-2026-003", date: "2026-02-11", client: "SAS Tech", items: 8, total: 2340.00, status: "livrée", paymentStatus: "payée", invoiceId: "FACT-2026-003" },
    { id: "CMD-2026-004", date: "2026-02-12", client: "Boulangerie Paris", items: 2, total: 450.00, status: "en préparation", paymentStatus: "en attente", invoiceId: null },
    { id: "CMD-2026-005", date: "2026-02-12", client: "Coiffure Moderne", items: 4, total: 675.30, status: "en attente", paymentStatus: "non payée", invoiceId: null },
    { id: "CMD-2026-006", date: "2026-02-10", client: "Restaurant Le Chef", items: 12, total: 1890.75, status: "livrée", paymentStatus: "en retard", invoiceId: "FACT-2026-006" },
    { id: "CMD-2026-007", date: "2026-02-13", client: "Garage Auto", items: 1, total: 320.00, status: "livrée", paymentStatus: "payée", invoiceId: "FACT-2026-007" },
    { id: "CMD-2026-008", date: "2026-02-13", client: "Cabinet Médical", items: 6, total: 1500.00, status: "expédiée", paymentStatus: "en attente", invoiceId: null },
    { id: "CMD-2026-009", date: "2026-02-14", client: "École Privée", items: 15, total: 3200.00, status: "en préparation", paymentStatus: "non payée", invoiceId: null },
    { id: "CMD-2026-010", date: "2026-02-14", client: "Pharmacie Centrale", items: 7, total: 780.25, status: "en attente", paymentStatus: "en attente", invoiceId: null },
    { id: "CMD-2026-011", date: "2026-02-15", client: "SAS Tech", items: 4, total: 1250.00, status: "confirmée", paymentStatus: "en attente", invoiceId: null },
    { id: "CMD-2026-012", date: "2026-02-15", client: "SARL Dupont", items: 8, total: 2300.00, status: "en préparation", paymentStatus: "non payée", invoiceId: null },
  ])

  // FACTURES
  const [invoices, setInvoices] = useState([
    { id: "FACT-2026-001", date: "2026-02-10", orderId: "CMD-2026-001", client: "SARL Dupont", amount: 1250.00, status: "payée", dueDate: "2026-03-10", archived: false },
    { id: "FACT-2026-002", date: "2026-02-11", orderId: "CMD-2026-002", client: "EURL Martin", amount: 890.50, status: "envoyée", dueDate: "2026-03-11", archived: false },
    { id: "FACT-2026-003", date: "2026-02-11", orderId: "CMD-2026-003", client: "SAS Tech", amount: 2340.00, status: "payée", dueDate: "2026-03-11", archived: false },
    { id: "FACT-2026-004", date: "2026-02-12", orderId: "CMD-2026-004", client: "Boulangerie Paris", amount: 450.00, status: "brouillon", dueDate: "2026-03-12", archived: false },
    { id: "FACT-2026-005", date: "2026-02-12", orderId: "CMD-2026-005", client: "Coiffure Moderne", amount: 675.30, status: "brouillon", dueDate: "2026-03-12", archived: false },
    { id: "FACT-2026-006", date: "2026-02-10", orderId: "CMD-2026-006", client: "Restaurant Le Chef", amount: 1890.75, status: "en retard", dueDate: "2026-02-25", archived: false },
    { id: "FACT-2026-007", date: "2026-02-13", orderId: "CMD-2026-007", client: "Garage Auto", amount: 320.00, status: "payée", dueDate: "2026-03-13", archived: false },
    { id: "FACT-2026-008", date: "2026-02-13", orderId: "CMD-2026-008", client: "Cabinet Médical", amount: 1500.00, status: "envoyée", dueDate: "2026-03-13", archived: false },
    { id: "FACT-2026-009", date: "2026-02-14", orderId: "CMD-2026-009", client: "École Privée", amount: 3200.00, status: "brouillon", dueDate: "2026-03-14", archived: false },
    { id: "FACT-2026-010", date: "2026-02-14", orderId: "CMD-2026-010", client: "Pharmacie Centrale", amount: 780.25, status: "envoyée", dueDate: "2026-03-14", archived: false },
    { id: "FACT-2025-045", date: "2025-12-15", orderId: "CMD-2025-089", client: "SARL Dupont", amount: 3450.00, status: "payée", dueDate: "2026-01-15", archived: true },
    { id: "FACT-2025-046", date: "2025-12-20", orderId: "CMD-2025-092", client: "SAS Tech", amount: 5600.00, status: "payée", dueDate: "2026-01-20", archived: true },
    { id: "FACT-2025-047", date: "2025-12-22", orderId: "CMD-2025-095", client: "Cabinet Médical", amount: 2100.00, status: "payée", dueDate: "2026-01-22", archived: true },
    { id: "FACT-2025-048", date: "2025-12-28", orderId: "CMD-2025-098", client: "Pharmacie Centrale", amount: 1850.00, status: "payée", dueDate: "2026-01-28", archived: true },
  ])

  // Formulaires
  const [clientForm, setClientForm] = useState({
    name: "", email: "", phone: "", address: "", siret: "", status: "actif"
  })

  const [orderForm, setOrderForm] = useState({
    client: "", items: "", total: "", status: "en attente", paymentStatus: "non payée"
  })

  const [invoiceForm, setInvoiceForm] = useState({
    orderId: "", dueDate: "", notes: ""
  })

  // ===== STATISTIQUES =====
  const stats = {
    totalOrders: orders.length,
    totalInvoices: invoices.filter(inv => !inv.archived).length,
    archivedInvoices: invoices.filter(inv => inv.archived).length,
    totalAmount: invoices.filter(inv => !inv.archived).reduce((acc, inv) => acc + inv.amount, 0),
    paidAmount: invoices.filter(inv => !inv.archived && inv.status === "payée").reduce((acc, inv) => acc + inv.amount, 0),
    pendingAmount: invoices.filter(inv => !inv.archived && (inv.status === "en attente" || inv.status === "envoyée")).reduce((acc, inv) => acc + inv.amount, 0),
    overdueAmount: invoices.filter(inv => !inv.archived && inv.status === "en retard").reduce((acc, inv) => acc + inv.amount, 0),
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === "actif").length,
    ordersToInvoice: orders.filter(o => !o.invoiceId).length,
    monthlyRevenue: 45890,
    lastMonthRevenue: 42300,
    growth: ((45890 - 42300) / 42300 * 100).toFixed(1)
  }

  // ===== AUTH =====
  useEffect(() => {
    const role = getUserRole()
    const email = getUserEmail()
    
    if (!isAuthenticated() || role !== "admin_facture") {
      navigate("/login")
    } else {
      setUserEmail(email)
      setUserName(email?.split('@')[0] || "Facturation")
      setLoading(false)
    }
  }, [navigate])

  // ===== FONCTIONS CLIENTS =====
  const handleAddClient = () => {
    if (clientForm.name.trim()) {
      const newClient = {
        id: clients.length + 1,
        ...clientForm,
        totalOrders: 0,
        totalSpent: 0,
        lastOrder: new Date().toISOString().split('T')[0]
      }
      setClients([...clients, newClient])
      resetClientForm()
      setShowClientModal(false)
      showNotification("Client ajouté avec succès", "success")
    }
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      siret: client.siret,
      status: client.status
    })
    setShowClientModal(true)
  }

  const handleUpdateClient = () => {
    if (clientForm.name.trim()) {
      setClients(clients.map(c => 
        c.id === editingClient.id 
          ? { ...c, ...clientForm }
          : c
      ))
      
      // Mettre à jour les commandes avec le nouveau nom du client
      if (editingClient.name !== clientForm.name) {
        setOrders(orders.map(o => 
          o.client === editingClient.name
            ? { ...o, client: clientForm.name }
            : o
        ))
        setInvoices(invoices.map(i => 
          i.client === editingClient.name
            ? { ...i, client: clientForm.name }
            : i
        ))
      }
      
      resetClientForm()
      setShowClientModal(false)
      setEditingClient(null)
      showNotification("Client modifié avec succès", "success")
    }
  }

  const handleDeleteClient = (clientId, clientName) => {
    const clientOrders = orders.filter(o => o.client === clientName)
    
    if (clientOrders.length > 0) {
      if (window.confirm(`Ce client a ${clientOrders.length} commande(s). Êtes-vous sûr de vouloir le supprimer ?`)) {
        setClients(clients.filter(c => c.id !== clientId))
        showNotification("Client supprimé", "warning")
      }
    } else {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
        setClients(clients.filter(c => c.id !== clientId))
        showNotification("Client supprimé", "warning")
      }
    }
  }

  // ===== FONCTIONS COMMANDES =====
  const handleAddOrder = () => {
    if (orderForm.client && orderForm.total) {
      const newOrder = {
        id: `CMD-2026-${String(orders.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        client: orderForm.client,
        items: parseInt(orderForm.items) || 1,
        total: parseFloat(orderForm.total),
        status: orderForm.status,
        paymentStatus: orderForm.paymentStatus,
        invoiceId: null
      }
      setOrders([newOrder, ...orders])
      
      // Mettre à jour les stats du client
      setClients(clients.map(c => 
        c.name === orderForm.client
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + parseFloat(orderForm.total),
              lastOrder: newOrder.date,
              status: "actif"
            }
          : c
      ))
      
      resetOrderForm()
      setShowOrderModal(false)
      showNotification("Commande créée avec succès", "success")
    }
  }

  const handleEditOrder = (order) => {
    setEditingOrder(order)
    setOrderForm({
      client: order.client,
      items: order.items.toString(),
      total: order.total.toString(),
      status: order.status,
      paymentStatus: order.paymentStatus
    })
    setShowOrderModal(true)
  }

  const handleUpdateOrder = () => {
    if (orderForm.client && orderForm.total) {
      const oldOrder = orders.find(o => o.id === editingOrder.id)
      
      setOrders(orders.map(o => 
        o.id === editingOrder.id
          ? {
              ...o,
              client: orderForm.client,
              items: parseInt(orderForm.items) || 1,
              total: parseFloat(orderForm.total),
              status: orderForm.status,
              paymentStatus: orderForm.paymentStatus
            }
          : o
      ))
      
      // Ajuster les stats du client si le client ou le total change
      if (oldOrder.client !== orderForm.client || oldOrder.total !== parseFloat(orderForm.total)) {
        // Ancien client
        setClients(clients.map(c => 
          c.name === oldOrder.client
            ? {
                ...c,
                totalOrders: Math.max(0, c.totalOrders - 1),
                totalSpent: Math.max(0, c.totalSpent - oldOrder.total)
              }
            : c
        ))
        
        // Nouveau client
        setClients(clients.map(c => 
          c.name === orderForm.client
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + parseFloat(orderForm.total),
                lastOrder: new Date().toISOString().split('T')[0]
              }
            : c
        ))
      }
      
      resetOrderForm()
      setShowOrderModal(false)
      setEditingOrder(null)
      showNotification("Commande modifiée avec succès", "success")
    }
  }

  const handleDeleteOrder = (orderId, clientName, orderTotal) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      setOrders(orders.filter(o => o.id !== orderId))
      
      // Mettre à jour les stats du client
      setClients(clients.map(c => 
        c.name === clientName
          ? {
              ...c,
              totalOrders: Math.max(0, c.totalOrders - 1),
              totalSpent: Math.max(0, c.totalSpent - orderTotal)
            }
          : c
      ))
      
      showNotification("Commande supprimée", "warning")
    }
  }

  // ===== FONCTIONS FACTURES =====
  const handleGenerateInvoice = (order) => {
    if (order.invoiceId) {
      alert("Cette commande a déjà une facture associée !")
      return
    }
    
    const newInvoice = {
      id: `FACT-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      orderId: order.id,
      client: order.client,
      amount: order.total,
      status: "envoyée",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      archived: false
    }
    
    setInvoices([newInvoice, ...invoices])
    
    // Associer la facture à la commande
    setOrders(orders.map(o => 
      o.id === order.id
        ? { ...o, invoiceId: newInvoice.id, paymentStatus: "en attente" }
        : o
    ))
    
    showNotification(`Facture ${newInvoice.id} générée avec succès`, "success")
  }

  const handleArchiveInvoice = (invoiceId) => {
    setInvoices(invoices.map(i => 
      i.id === invoiceId
        ? { ...i, archived: true }
        : i
    ))
    showNotification("Facture archivée", "info")
  }

  const handleUnarchiveInvoice = (invoiceId) => {
    setInvoices(invoices.map(i => 
      i.id === invoiceId
        ? { ...i, archived: false }
        : i
    ))
    showNotification("Facture désarchivée", "info")
  }

  const handleMarkAsPaid = (invoiceId) => {
    setInvoices(invoices.map(i => 
      i.id === invoiceId
        ? { ...i, status: "payée" }
        : i
    ))
    
    // Mettre à jour le statut de paiement de la commande associée
    const invoice = invoices.find(i => i.id === invoiceId)
    if (invoice) {
      setOrders(orders.map(o => 
        o.id === invoice.orderId
          ? { ...o, paymentStatus: "payée" }
          : o
      ))
    }
    
    showNotification("Facture marquée comme payée", "success")
  }

  // ===== FILTRES =====
  const getFilteredOrders = () => {
    let filtered = [...orders]
    
    // Filtre par date
    if (dateFilter.start) {
      filtered = filtered.filter(o => o.date >= dateFilter.start)
    }
    if (dateFilter.end) {
      filtered = filtered.filter(o => o.date <= dateFilter.end)
    }
    
    // Recherche par client
    if (searchClient) {
      filtered = filtered.filter(o => 
        o.client.toLowerCase().includes(searchClient.toLowerCase())
      )
    }
    
    // Recherche générale
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtre par statut
    if (filterStatus !== "tous") {
      filtered = filtered.filter(o => o.status === filterStatus)
    }
    
    return filtered
  }

  const getFilteredClients = () => {
    let filtered = [...clients]
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.siret.includes(searchTerm)
      )
    }
    
    return filtered
  }

  const getFilteredInvoices = (archived = false) => {
    let filtered = invoices.filter(i => i.archived === archived)
    
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  // ===== NOTIFICATIONS =====
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000)
  }

  // ===== RESET FORMS =====
  const resetClientForm = () => {
    setClientForm({ name: "", email: "", phone: "", address: "", siret: "", status: "actif" })
    setEditingClient(null)
  }

  const resetOrderForm = () => {
    setOrderForm({ client: "", items: "1", total: "", status: "en attente", paymentStatus: "non payée" })
    setEditingOrder(null)
  }

  const resetInvoiceForm = () => {
    setInvoiceForm({ orderId: "", dueDate: "", notes: "" })
    setSelectedOrderForInvoice(null)
  }

  // ===== UTILS =====
  const formatCurrency = (amount) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "payée": return "#10b981"
      case "en attente": return "#f59e0b"
      case "envoyée": return "#3b82f6"
      case "brouillon": return "#6b7280"
      case "en retard": return "#ef4444"
      case "livrée": return "#10b981"
      case "expédiée": return "#3b82f6"
      case "en préparation": return "#8b5cf6"
      case "confirmée": return "#8b5cf6"
      case "non payée": return "#ef4444"
      case "actif": return "#10b981"
      case "inactif": return "#6b7280"
      default: return "#6b7280"
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case "payée": return "#d1fae5"
      case "en attente": return "#fef3c7"
      case "envoyée": return "#dbeafe"
      case "brouillon": return "#f3f4f6"
      case "en retard": return "#fee2e2"
      case "livrée": return "#d1fae5"
      case "expédiée": return "#dbeafe"
      case "en préparation": return "#ede9fe"
      case "confirmée": return "#ede9fe"
      case "non payée": return "#fee2e2"
      case "actif": return "#d1fae5"
      case "inactif": return "#f3f4f6"
      default: return "#f3f4f6"
    }
  }

  if (loading) {
    return (
      <div className="facture-loading">
        <div className="spinner"></div>
        <p>Chargement de votre espace facturation...</p>
      </div>
    )
  }

  return (
    <div className="facture-container">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <div className="facture-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#f59e0b"/>
                <path d="M8 16L12 20L20 12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1>ERP FACTURE</h1>
              <p>Gestion comptable</p>
            </div>
          </div>
          <span className="role-badge">
            COMPTABLE
          </span>
        </div>

        <div className="user-profile">
          <div className="avatar">
            {userName?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="user-info">
            <div className="user-name">{userName || "Comptable"}</div>
            <div className="user-email">{userEmail || "compta@erp.com"}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="nav-icon">📊</span>
            <span>Tableau de bord</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="nav-icon">📦</span>
            <span>Commandes</span>
            <span className="nav-count">{stats.totalOrders}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "clients" ? "active" : ""}`}
            onClick={() => setActiveTab("clients")}
          >
            <span className="nav-icon">👥</span>
            <span>Clients</span>
            <span className="nav-count">{stats.totalClients}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "invoices" ? "active" : ""}`}
            onClick={() => setActiveTab("invoices")}
          >
            <span className="nav-icon">📄</span>
            <span>Factures</span>
            <span className="nav-count">{stats.totalInvoices}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "archive" ? "active" : ""}`}
            onClick={() => setActiveTab("archive")}
          >
            <span className="nav-icon">📦</span>
            <span>Archive</span>
            <span className="nav-count">{stats.archivedInvoices}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <span className="nav-icon">📈</span>
            <span>Rapports</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => {
            clearAuth()
            navigate("/login")
          }} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="facture-main">
        {/* HEADER */}
        <div className="main-header">
          <div>
            <h1 className="welcome-title">
              Bonjour, <span style={{ color: "#f59e0b" }}>{userName || "Comptable"}</span>
            </h1>
            <p className="welcome-subtitle">
              Gérez les commandes, clients et factures en toute simplicité
            </p>
          </div>
          <div className="header-actions">
            <div className="date-box">
              <span className="date-icon">📅</span>
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* ===== TABLEAU DE BORD ===== */}
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            {/* STATISTIQUES */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fef3c7", color: "#f59e0b" }}>
                  📦
                </div>
                <div className="stat-content">
                  <h3>{stats.totalOrders}</h3>
                  <p>Commandes</p>
                  <span className="stat-badge">{stats.ordersToInvoice} à facturer</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#d1fae5", color: "#10b981" }}>
                  👥
                </div>
                <div className="stat-content">
                  <h3>{stats.totalClients}</h3>
                  <p>Clients</p>
                  <span className="stat-badge">{stats.activeClients} actifs</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#dbeafe", color: "#3b82f6" }}>
                  📄
                </div>
                <div className="stat-content">
                  <h3>{stats.totalInvoices}</h3>
                  <p>Factures</p>
                  <span className="stat-badge">{stats.archivedInvoices} archivées</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#fee2e2", color: "#ef4444" }}>
                  ⚠️
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats.overdueAmount)}</h3>
                  <p>Impayés</p>
                  <span className="stat-badge">À relancer</span>
                </div>
              </div>
              <div className="stat-card stat-card-large">
                <div className="stat-icon" style={{ background: "#ede9fe", color: "#8b5cf6" }}>
                  💰
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats.totalAmount)}</h3>
                  <p>Chiffre d'affaires</p>
                  <span className="stat-badge">+{stats.growth}% vs mois dernier</span>
                </div>
              </div>
            </div>

            {/* ACTIONS RAPIDES */}
            <div className="quick-actions">
              <h3>Actions rapides</h3>
              <div className="actions-grid">
                <button className="action-card" onClick={() => { resetOrderForm(); setShowOrderModal(true); }}>
                  <span className="action-icon">➕</span>
                  <span>Nouvelle commande</span>
                </button>
                <button className="action-card" onClick={() => { resetClientForm(); setShowClientModal(true); }}>
                  <span className="action-icon">👤</span>
                  <span>Nouveau client</span>
                </button>
                <button className="action-card" onClick={() => setActiveTab("orders")}>
                  <span className="action-icon">📋</span>
                  <span>Commandes à facturer ({stats.ordersToInvoice})</span>
                </button>
                <button className="action-card" onClick={() => setActiveTab("archive")}>
                  <span className="action-icon">📦</span>
                  <span>Archive factures</span>
                </button>
              </div>
            </div>

            {/* ACTIVITÉ RÉCENTE */}
            <div className="recent-activity">
              <h3>Activité récente</h3>
              <div className="activity-list">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="activity-item">
                    <span className="activity-icon">📦</span>
                    <div className="activity-details">
                      <div className="activity-title">
                        <strong>{order.id}</strong> - {order.client}
                      </div>
                      <div className="activity-meta">
                        <span>{formatDate(order.date)}</span>
                        <span className={`status-dot ${order.status}`}></span>
                        <span>{order.status}</span>
                      </div>
                    </div>
                    <span className="activity-amount">{formatCurrency(order.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== COMMANDES ===== */}
        {activeTab === "orders" && (
          <div className="orders-content">
            <div className="content-header">
              <div className="header-left">
                <h2>📦 Historique des commandes</h2>
                <span className="header-count">{getFilteredOrders().length} commandes</span>
              </div>
              <div className="header-right">
                <button className="btn-primary" onClick={() => { resetOrderForm(); setShowOrderModal(true); }}>
                  <span>+</span> Nouvelle commande
                </button>
              </div>
            </div>

            {/* FILTRES */}
            <div className="filters-bar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Rechercher par N° commande ou client..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <div className="date-filter">
                  <input 
                    type="date" 
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                    placeholder="Date début"
                  />
                  <span>à</span>
                  <input 
                    type="date" 
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                    placeholder="Date fin"
                  />
                </div>
                <select 
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="tous">Tous les statuts</option>
                  <option value="en attente">En attente</option>
                  <option value="confirmée">Confirmée</option>
                  <option value="en préparation">En préparation</option>
                  <option value="expédiée">Expédiée</option>
                  <option value="livrée">Livrée</option>
                </select>
              </div>
            </div>

            {/* TABLEAU COMMANDES */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Commande</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Articles</th>
                    <th>Total</th>
                    <th>Statut</th>
                    <th>Paiement</th>
                    <th>Facture</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredOrders().map(order => (
                    <tr key={order.id}>
                      <td className="order-number">{order.id}</td>
                      <td>{formatDate(order.date)}</td>
                      <td className="client-name">{order.client}</td>
                      <td>{order.items} articles</td>
                      <td className="amount">{formatCurrency(order.total)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{
                            background: getStatusBg(order.status),
                            color: getStatusColor(order.status)
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{
                            background: getStatusBg(order.paymentStatus),
                            color: getStatusColor(order.paymentStatus)
                          }}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>
                        {order.invoiceId ? (
                          <span className="invoice-linked" title={`Facture ${order.invoiceId}`}>
                            ✅ {order.invoiceId}
                          </span>
                        ) : (
                          <button 
                            className="btn-small btn-warning" 
                            onClick={() => handleGenerateInvoice(order)}
                          >
                            Générer
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn" onClick={() => handleEditOrder(order)} title="Modifier">✏️</button>
                          <button className="action-btn" onClick={() => handleDeleteOrder(order.id, order.client, order.total)} title="Supprimer">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== CLIENTS ===== */}
        {activeTab === "clients" && (
          <div className="clients-content">
            <div className="content-header">
              <div className="header-left">
                <h2>👥 Gestion des clients</h2>
                <span className="header-count">{getFilteredClients().length} clients</span>
              </div>
              <div className="header-right">
                <button className="btn-primary" onClick={() => { resetClientForm(); setShowClientModal(true); }}>
                  <span>+</span> Nouveau client
                </button>
              </div>
            </div>

            {/* RECHERCHE CLIENTS */}
            <div className="search-section">
              <div className="search-box large">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Rechercher par nom, email ou SIRET..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* GRILLE CLIENTS */}
            <div className="clients-grid">
              {getFilteredClients().map(client => (
                <div key={client.id} className="client-card">
                  <div className="client-card-header">
                    <div className="client-avatar">
                      {client.name.charAt(0)}
                    </div>
                    <div className="client-basic-info">
                      <h4>{client.name}</h4>
                      <p className="client-siret">SIRET: {client.siret}</p>
                    </div>
                    <span 
                      className="client-status"
                      style={{
                        background: getStatusBg(client.status),
                        color: getStatusColor(client.status)
                      }}
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="client-card-body">
                    <div className="client-contact">
                      <p><span>📧</span> {client.email}</p>
                      <p><span>📞</span> {client.phone}</p>
                      <p><span>📍</span> {client.address}</p>
                    </div>
                    <div className="client-stats">
                      <div className="client-stat">
                        <span>Commandes</span>
                        <strong>{client.totalOrders}</strong>
                      </div>
                      <div className="client-stat">
                        <span>Total</span>
                        <strong>{formatCurrency(client.totalSpent)}</strong>
                      </div>
                      <div className="client-stat">
                        <span>Dernière</span>
                        <strong>{formatDate(client.lastOrder)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="client-card-footer">
                    <button className="btn-outline" onClick={() => {
                      setSearchTerm(client.name)
                      setActiveTab("orders")
                    }}>
                      Voir commandes
                    </button>
                    <button className="btn-icon" onClick={() => handleEditClient(client)} title="Modifier">✏️</button>
                    <button className="btn-icon" onClick={() => handleDeleteClient(client.id, client.name)} title="Supprimer">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== FACTURES ===== */}
        {activeTab === "invoices" && (
          <div className="invoices-content">
            <div className="content-header">
              <div className="header-left">
                <h2>📄 Factures émises</h2>
                <span className="header-count">{getFilteredInvoices(false).length} factures</span>
              </div>
            </div>

            {/* RECHERCHE FACTURES */}
            <div className="search-section">
              <div className="search-box large">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Rechercher par N° facture, client ou commande..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* TABLEAU FACTURES */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Date</th>
                    <th>Commande</th>
                    <th>Client</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Échéance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredInvoices(false).map(invoice => (
                    <tr key={invoice.id}>
                      <td className="invoice-number">{invoice.id}</td>
                      <td>{formatDate(invoice.date)}</td>
                      <td className="order-id">{invoice.orderId}</td>
                      <td className="client-name">{invoice.client}</td>
                      <td className="amount">{formatCurrency(invoice.amount)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{
                            background: getStatusBg(invoice.status),
                            color: getStatusColor(invoice.status)
                          }}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className={new Date(invoice.dueDate) < new Date() && invoice.status !== "payée" ? "text-danger" : ""}>
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {invoice.status !== "payée" && (
                            <button className="action-btn success" onClick={() => handleMarkAsPaid(invoice.id)} title="Marquer comme payée">💰</button>
                          )}
                          <button className="action-btn" onClick={() => handleArchiveInvoice(invoice.id)} title="Archiver">📦</button>
                          <button className="action-btn" title="Télécharger PDF">📥</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ARCHIVE ===== */}
        {activeTab === "archive" && (
          <div className="archive-content">
            <div className="content-header">
              <div className="header-left">
                <h2>📦 Archive des factures</h2>
                <span className="header-count">{getFilteredInvoices(true).length} factures archivées</span>
              </div>
            </div>

            {/* RECHERCHE ARCHIVE */}
            <div className="search-section">
              <div className="search-box large">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Rechercher dans les archives..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* TABLEAU ARCHIVE */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Date</th>
                    <th>Commande</th>
                    <th>Client</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredInvoices(true).map(invoice => (
                    <tr key={invoice.id}>
                      <td className="invoice-number">{invoice.id}</td>
                      <td>{formatDate(invoice.date)}</td>
                      <td className="order-id">{invoice.orderId}</td>
                      <td className="client-name">{invoice.client}</td>
                      <td className="amount">{formatCurrency(invoice.amount)}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{
                            background: getStatusBg(invoice.status),
                            color: getStatusColor(invoice.status)
                          }}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => handleUnarchiveInvoice(invoice.id)} title="Désarchiver">📂</button>
                        <button className="action-btn" title="Télécharger PDF">📥</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== RAPPORTS ===== */}
        {activeTab === "reports" && (
          <div className="reports-content">
            <div className="content-header">
              <div className="header-left">
                <h2>📈 Rapports financiers</h2>
              </div>
            </div>

            <div className="reports-grid">
              <div className="report-card">
                <div className="report-icon">📊</div>
                <h4>Chiffre d'affaires</h4>
                <p className="report-value">{formatCurrency(stats.totalAmount)}</p>
                <p className="report-period">Année 2026</p>
                <button className="btn-outline">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon">📋</div>
                <h4>Factures émises</h4>
                <p className="report-value">{stats.totalInvoices}</p>
                <p className="report-period">Total factures</p>
                <button className="btn-outline">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon">💰</div>
                <h4>Paiements reçus</h4>
                <p className="report-value">{stats.paidInvoices}</p>
                <p className="report-period">{formatCurrency(stats.paidAmount)}</p>
                <button className="btn-outline">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon">⚠️</div>
                <h4>Impayés</h4>
                <p className="report-value">{formatCurrency(stats.overdueAmount)}</p>
                <p className="report-period">{stats.overdueAmount > 0 ? "À relancer" : "Aucun impayé"}</p>
                <button className="btn-outline">Télécharger PDF</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODAL CLIENT ===== */}
      {showClientModal && (
        <div className="modal-overlay" onClick={() => {
          setShowClientModal(false)
          resetClientForm()
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingClient ? '✏️ Modifier le client' : '➕ Nouveau client'}</h3>
              <button className="modal-close" onClick={() => {
                setShowClientModal(false)
                resetClientForm()
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom de l'entreprise *</label>
                <input
                  type="text"
                  placeholder="Ex: SARL Dupont"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="contact@entreprise.fr"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input
                  type="text"
                  placeholder="12 Rue de Paris, 75001 Paris"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({...clientForm, address: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>SIRET</label>
                  <input
                    type="text"
                    placeholder="123 456 789 00012"
                    value={clientForm.siret}
                    onChange={(e) => setClientForm({...clientForm, siret: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({...clientForm, status: e.target.value})}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowClientModal(false)
                resetClientForm()
              }}>Annuler</button>
              <button 
                className="btn-primary" 
                onClick={editingClient ? handleUpdateClient : handleAddClient}
              >
                {editingClient ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL COMMANDE ===== */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => {
          setShowOrderModal(false)
          resetOrderForm()
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingOrder ? '✏️ Modifier la commande' : '➕ Nouvelle commande'}</h3>
              <button className="modal-close" onClick={() => {
                setShowOrderModal(false)
                resetOrderForm()
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Client *</label>
                <select
                  value={orderForm.client}
                  onChange={(e) => setOrderForm({...orderForm, client: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.filter(c => c.status === "actif").map(client => (
                    <option key={client.id} value={client.name}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre d'articles</label>
                  <input
                    type="number"
                    min="1"
                    value={orderForm.items}
                    onChange={(e) => setOrderForm({...orderForm, items: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Montant total (€) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={orderForm.total}
                    onChange={(e) => setOrderForm({...orderForm, total: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Statut commande</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => setOrderForm({...orderForm, status: e.target.value})}
                  >
                    <option value="en attente">En attente</option>
                    <option value="confirmée">Confirmée</option>
                    <option value="en préparation">En préparation</option>
                    <option value="expédiée">Expédiée</option>
                    <option value="livrée">Livrée</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut paiement</label>
                  <select
                    value={orderForm.paymentStatus}
                    onChange={(e) => setOrderForm({...orderForm, paymentStatus: e.target.value})}
                  >
                    <option value="non payée">Non payée</option>
                    <option value="en attente">En attente</option>
                    <option value="payée">Payée</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowOrderModal(false)
                resetOrderForm()
              }}>Annuler</button>
              <button 
                className="btn-primary" 
                onClick={editingOrder ? handleUpdateOrder : handleAddOrder}
              >
                {editingOrder ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacturationAdmin
