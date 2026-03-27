import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { clearAuth, getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"
import "./FinanceAdmin.css"

function FinanceAdmin() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedPeriod, setSelectedPeriod] = useState("mois")

  // Données des transactions
  const [transactions, setTransactions] = useState([
    { id: "TRX-2026-001", date: "2026-02-10", description: "Vente SARL Dupont", category: "Vente", amount: 1250.00, type: "revenu", status: "complété", account: "Compte courant" },
    { id: "TRX-2026-002", date: "2026-02-10", description: "Achat fournitures bureau", category: "Achat", amount: -450.00, type: "dépense", status: "complété", account: "Compte courant" },
    { id: "TRX-2026-003", date: "2026-02-11", description: "Facture EURL Martin", category: "Vente", amount: 890.50, type: "revenu", status: "en attente", account: "Compte client" },
    { id: "TRX-2026-004", date: "2026-02-11", description: "Loyer local", category: "Loyer", amount: -1200.00, type: "dépense", status: "complété", account: "Compte courant" },
    { id: "TRX-2026-005", date: "2026-02-12", description: "Facture SAS Tech", category: "Vente", amount: 2340.00, type: "revenu", status: "complété", account: "Compte courant" },
    { id: "TRX-2026-006", date: "2026-02-12", description: "Salaires", category: "Salaires", amount: -8500.00, type: "dépense", status: "complété", account: "Compte paie" },
    { id: "TRX-2026-007", date: "2026-02-13", description: "Facture Restaurant Le Chef", category: "Vente", amount: 1890.75, type: "revenu", status: "en retard", account: "Compte client" },
    { id: "TRX-2026-008", date: "2026-02-13", description: "Fournisseur électricité", category: "Utilities", amount: -320.00, type: "dépense", status: "complété", account: "Compte courant" },
    { id: "TRX-2026-009", date: "2026-02-14", description: "Facture Cabinet Médical", category: "Vente", amount: 1500.00, type: "revenu", status: "en attente", account: "Compte client" },
    { id: "TRX-2026-010", date: "2026-02-14", description: "Maintenance informatique", category: "Services", amount: -650.00, type: "dépense", status: "complété", account: "Compte courant" },
  ])

  // Données des comptes
  const [accounts, setAccounts] = useState([
    { id: 1, name: "Compte courant", balance: 45230.50, type: "Banque", number: "FR76 1234 5678 9012 3456", status: "actif" },
    { id: 2, name: "Compte épargne", balance: 25000.00, type: "Épargne", number: "FR76 2345 6789 0123 4567", status: "actif" },
    { id: 3, name: "Compte client", balance: 12780.25, type: "Créance", number: "CLI-001", status: "actif" },
    { id: 4, name: "Compte fournisseur", balance: -3450.00, type: "Dette", number: "FR76 3456 7890 1234 5678", status: "actif" },
    { id: 5, name: "Compte paie", balance: 15000.00, type: "Banque", number: "FR76 4567 8901 2345 6789", status: "actif" },
  ])

  // Données des budgets
  const [budgets, setBudgets] = useState([
    { id: 1, category: "Salaires", budget: 8500.00, actual: 8500.00, month: "2026-02", status: "respecté" },
    { id: 2, category: "Loyer", budget: 1200.00, actual: 1200.00, month: "2026-02", status: "respecté" },
    { id: 3, category: "Fournitures", budget: 500.00, actual: 450.00, month: "2026-02", status: "respecté" },
    { id: 4, category: "Marketing", budget: 800.00, actual: 950.00, month: "2026-02", status: "dépassé" },
    { id: 5, category: "Utilities", budget: 400.00, actual: 320.00, month: "2026-02", status: "respecté" },
  ])

  // Données des prévisions
  const [forecasts, setForecasts] = useState([
    { month: "Jan", revenue: 12450, expenses: 8900, profit: 3550 },
    { month: "Fév", revenue: 15890, expenses: 11200, profit: 4690 },
    { month: "Mar", revenue: 14320, expenses: 10100, profit: 4220 },
    { month: "Avr", revenue: 16780, expenses: 11900, profit: 4880 },
    { month: "Mai", revenue: 18900, expenses: 13400, profit: 5500 },
    { month: "Juin", revenue: 20150, expenses: 14200, profit: 5950 },
  ])

  // Calcul des statistiques financières
  const stats = {
    totalRevenue: transactions.filter(t => t.type === "revenu").reduce((acc, t) => acc + t.amount, 0),
    totalExpenses: Math.abs(transactions.filter(t => t.type === "dépense").reduce((acc, t) => acc + t.amount, 0)),
    netProfit: transactions.reduce((acc, t) => acc + t.amount, 0),
    pendingTransactions: transactions.filter(t => t.status === "en attente" || t.status === "en retard").length,
    totalBalance: accounts.reduce((acc, a) => acc + a.balance, 0),
    activeAccounts: accounts.filter(a => a.status === "actif").length,
    totalTransactions: transactions.length,
    cashFlow: 45230.50, // Solde compte courant
  }

  useEffect(() => {
    const role = getUserRole()
    const email = getUserEmail()
    
    if (!isAuthenticated() || role !== "admin_finance") {
      navigate("/login")
    } else {
      setUserEmail(email)
      setUserName(email?.split('@')[0] || "Finance")
      setLoading(false)
    }
  }, [navigate])

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "complété": return "#48bb78"
      case "en attente": return "#ed8936"
      case "en retard": return "#f56565"
      case "respecté": return "#48bb78"
      case "dépassé": return "#f56565"
      case "actif": return "#48bb78"
      case "inactif": return "#a0aec0"
      default: return "#718096"
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case "complété": return "#c6f6d5"
      case "en attente": return "#feebc8"
      case "en retard": return "#fed7d7"
      case "respecté": return "#c6f6d5"
      case "dépassé": return "#fed7d7"
      case "actif": return "#c6f6d5"
      case "inactif": return "#edf2f7"
      default: return "#e2e8f0"
    }
  }

  const getTypeColor = (type) => {
    return type === "revenu" ? "#48bb78" : "#f56565"
  }

  const getTypeBg = (type) => {
    return type === "revenu" ? "#c6f6d5" : "#fed7d7"
  }

  const formatCurrency = (amount) => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="finance-loading">
        <div className="spinner"></div>
        <p>Chargement de votre espace finance...</p>
      </div>
    )
  }

  return (
    <div className="finance-container">
      {/* ===== SIDEBAR GAUCHE ===== */}
      <div className="finance-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#4299e1"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <div>
              <h1>ERP</h1>
              <p>Finance</p>
            </div>
          </div>
          <span className="role-badge" style={{ background: "#4299e1" }}>
            ADMIN FINANCE
          </span>
        </div>

        <div className="user-profile">
          <div className="avatar" style={{ background: "linear-gradient(135deg, #4299e1, #2b6cb0)" }}>
            {userName?.charAt(0).toUpperCase() || "F"}
          </div>
          <div className="user-info">
            <div className="user-name">{userName || "Gestionnaire"}</div>
            <div className="user-email">{userEmail || "finance@erp.com"}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="nav-icon">📊</span>
            Tableau de bord
          </button>
          <button 
            className={`nav-item ${activeTab === "transactions" ? "active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <span className="nav-icon">💰</span>
            Transactions
            <span className="nav-count">{stats.totalTransactions}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "accounts" ? "active" : ""}`}
            onClick={() => setActiveTab("accounts")}
          >
            <span className="nav-icon">🏦</span>
            Comptes
            <span className="nav-count">{stats.activeAccounts}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "budgets" ? "active" : ""}`}
            onClick={() => setActiveTab("budgets")}
          >
            <span className="nav-icon">📋</span>
            Budgets
          </button>
          <button 
            className={`nav-item ${activeTab === "forecasts" ? "active" : ""}`}
            onClick={() => setActiveTab("forecasts")}
          >
            <span className="nav-icon">📈</span>
            Prévisions
          </button>
          <button 
            className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <span className="nav-icon">📑</span>
            Rapports
          </button>
          <button 
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="nav-icon">⚙️</span>
            Paramètres
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="finance-main">
        {/* HEADER */}
        <div className="main-header">
          <div>
            <h1 className="welcome-title">
              💰 Bonjour, <span style={{ color: "#4299e1" }}>{userName || "Gestionnaire"}</span>
            </h1>
            <p className="welcome-subtitle">
              Gérez vos finances, transactions et budgets en temps réel
            </p>
          </div>
          <div className="header-actions">
            <div className="date-box">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            <button className="btn-primary" style={{ background: "#4299e1" }}>
              + Nouvelle transaction
            </button>
          </div>
        </div>

        {/* ===== TABLEAU DE BORD ===== */}
        {activeTab === "dashboard" && (
          <div className="dashboard-content">
            {/* STATISTIQUES FINANCIÈRES */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#48bb7815", color: "#48bb78" }}>
                  📈
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats.totalRevenue)}</h3>
                  <p>Revenus</p>
                  <small>+12% vs mois dernier</small>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#f5656515", color: "#f56565" }}>
                  📉
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats.totalExpenses)}</h3>
                  <p>Dépenses</p>
                  <small>-5% vs mois dernier</small>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#4299e115", color: "#4299e1" }}>
                  💰
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats.netProfit)}</h3>
                  <p>Bénéfice net</p>
                  <small>Marge: 23%</small>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "#ed893615", color: "#ed8936" }}>
                  ⏳
                </div>
                <div className="stat-content">
                  <h3>{stats.pendingTransactions}</h3>
                  <p>En attente</p>
                  <small>Transactions</small>
                </div>
              </div>
              <div className="stat-card stat-card-large">
                <div className="stat-icon" style={{ background: "#9f7aea15", color: "#9f7aea" }}>
                  🏦
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(stats.totalBalance)}</h3>
                  <p>Solde total</p>
                  <small>Tous comptes confondus</small>
                </div>
              </div>
            </div>

            {/* GRAPHIQUES ET FLUX */}
            <div className="dashboard-row">
              <div className="dashboard-col-8">
                <div className="chart-card">
                  <div className="card-header">
                    <h3>📊 Évolution financière</h3>
                    <select 
                      className="period-select"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                      <option value="mois">Ce mois</option>
                      <option value="trimestre">Ce trimestre</option>
                      <option value="annee">Cette année</option>
                    </select>
                  </div>
                  <div className="chart-container">
                    <div className="chart-legend">
                      <span className="legend-item">
                        <span className="legend-color" style={{ background: "#48bb78" }}></span>
                        Revenus
                      </span>
                      <span className="legend-item">
                        <span className="legend-color" style={{ background: "#f56565" }}></span>
                        Dépenses
                      </span>
                      <span className="legend-item">
                        <span className="legend-color" style={{ background: "#4299e1" }}></span>
                        Bénéfice
                      </span>
                    </div>
                    <div className="chart-bars-group">
                      {forecasts.map((item, index) => (
                        <div key={index} className="chart-bar-group">
                          <div 
                            className="chart-bar-revenue"
                            style={{ 
                              height: `${(item.revenue / 21000) * 120}px`,
                              background: "#48bb78"
                            }}
                          ></div>
                          <div 
                            className="chart-bar-expenses"
                            style={{ 
                              height: `${(item.expenses / 21000) * 120}px`,
                              background: "#f56565"
                            }}
                          ></div>
                          <div 
                            className="chart-bar-profit"
                            style={{ 
                              height: `${(item.profit / 21000) * 120}px`,
                              background: "#4299e1"
                            }}
                          ></div>
                          <span className="chart-label">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="dashboard-col-4">
                <div className="cashflow-card">
                  <div className="card-header">
                    <h3>💰 Trésorerie</h3>
                  </div>
                  <div className="cashflow-amount">
                    {formatCurrency(stats.cashFlow)}
                  </div>
                  <div className="cashflow-details">
                    <div className="cashflow-item">
                      <span>Entrées (mois)</span>
                      <strong className="text-success">{formatCurrency(5480)}</strong>
                    </div>
                    <div className="cashflow-item">
                      <span>Sorties (mois)</span>
                      <strong className="text-danger">{formatCurrency(3120)}</strong>
                    </div>
                    <div className="cashflow-item total">
                      <span>Flux net</span>
                      <strong className="text-success">{formatCurrency(2360)}</strong>
                    </div>
                  </div>
                  <div className="cashflow-footer">
                    <button className="btn-small">Voir détails</button>
                  </div>
                </div>

                <div className="quick-actions-card">
                  <div className="card-header">
                    <h3>⚡ Actions rapides</h3>
                  </div>
                  <div className="quick-actions-grid">
                    <button className="quick-action-btn">
                      <span className="quick-icon">➕</span>
                      <span>Transaction</span>
                    </button>
                    <button className="quick-action-btn">
                      <span className="quick-icon">📤</span>
                      <span>Virement</span>
                    </button>
                    <button className="quick-action-btn">
                      <span className="quick-icon">📋</span>
                      <span>Budget</span>
                    </button>
                    <button className="quick-action-btn">
                      <span className="quick-icon">📊</span>
                      <span>Rapport</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS RÉCENTES */}
            <div className="recent-transactions">
              <div className="card-header">
                <h3>🕐 Transactions récentes</h3>
                <button className="btn-link" onClick={() => setActiveTab("transactions")}>
                  Voir tout →
                </button>
              </div>
              <div className="table-responsive">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Catégorie</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(transaction => (
                      <tr key={transaction.id}>
                        <td>{formatDate(transaction.date)}</td>
                        <td className="transaction-desc">{transaction.description}</td>
                        <td>{transaction.category}</td>
                        <td className={transaction.type === "revenu" ? "text-success" : "text-danger"}>
                          <strong>{transaction.type === "revenu" ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}</strong>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{
                              background: getStatusBg(transaction.status),
                              color: getStatusColor(transaction.status)
                            }}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== TRANSACTIONS ===== */}
        {activeTab === "transactions" && (
          <div className="transactions-content">
            <div className="content-header">
              <div className="header-left">
                <h2>💰 Toutes les transactions</h2>
                <span className="header-count">{stats.totalTransactions} transactions</span>
              </div>
              <div className="header-right">
                <button className="btn-secondary">📤 Exporter</button>
                <button className="btn-primary" style={{ background: "#4299e1" }}>
                  + Nouvelle transaction
                </button>
              </div>
            </div>

            {/* FILTRES */}
            <div className="filters-bar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Rechercher une transaction..." 
                  className="search-input"
                />
              </div>
              <div className="filter-group">
                <select className="filter-select">
                  <option>Tous les types</option>
                  <option>Revenu</option>
                  <option>Dépense</option>
                </select>
                <select className="filter-select">
                  <option>Tous les statuts</option>
                  <option>Complété</option>
                  <option>En attente</option>
                  <option>En retard</option>
                </select>
                <select className="filter-select">
                  <option>Toutes les catégories</option>
                  <option>Vente</option>
                  <option>Achat</option>
                  <option>Salaires</option>
                  <option>Loyer</option>
                </select>
              </div>
            </div>

            {/* TABLEAU TRANSACTIONS */}
            <div className="table-container">
              <table className="transactions-full-table">
                <thead>
                  <tr>
                    <th>N° Transaction</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Catégorie</th>
                    <th>Compte</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="transaction-number">{transaction.id}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td className="transaction-desc">{transaction.description}</td>
                      <td>{transaction.category}</td>
                      <td className="transaction-account">{transaction.account}</td>
                      <td className={transaction.type === "revenu" ? "text-success" : "text-danger"}>
                        <strong>{transaction.type === "revenu" ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}</strong>
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{
                            background: getStatusBg(transaction.status),
                            color: getStatusColor(transaction.status)
                          }}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn" title="Visualiser">👁️</button>
                          <button className="action-btn" title="Modifier">✏️</button>
                          <button className="action-btn" title="Plus">⋯</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="pagination">
              <span className="pagination-info">1-10 sur 24 transactions</span>
              <div className="pagination-controls">
                <button className="pagination-btn" disabled>←</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">→</button>
              </div>
              <select className="pagination-limit">
                <option>10 par page</option>
                <option>25 par page</option>
                <option>50 par page</option>
              </select>
            </div>
          </div>
        )}

        {/* ===== COMPTES ===== */}
        {activeTab === "accounts" && (
          <div className="accounts-content">
            <div className="content-header">
              <div className="header-left">
                <h2>🏦 Comptes bancaires</h2>
                <span className="header-count">{stats.activeAccounts} comptes actifs</span>
              </div>
              <div className="header-right">
                <button className="btn-secondary">📤 Exporter</button>
                <button className="btn-primary" style={{ background: "#4299e1" }}>
                  + Nouveau compte
                </button>
              </div>
            </div>

            <div className="accounts-grid">
              {accounts.map(account => (
                <div key={account.id} className="account-card">
                  <div className="account-card-header">
                    <div className="account-icon" style={{ background: "#4299e115", color: "#4299e1" }}>
                      {account.type === "Banque" ? "🏦" : account.type === "Épargne" ? "💰" : "📋"}
                    </div>
                    <div className="account-info">
                      <h4>{account.name}</h4>
                      <p className="account-number">{account.number}</p>
                    </div>
                    <span 
                      className="status-badge"
                      style={{
                        background: getStatusBg(account.status),
                        color: getStatusColor(account.status)
                      }}
                    >
                      {account.status}
                    </span>
                  </div>
                  <div className="account-card-body">
                    <div className="account-balance">
                      <span>Solde</span>
                      <strong className={account.balance >= 0 ? "text-success" : "text-danger"}>
                        {formatCurrency(account.balance)}
                      </strong>
                    </div>
                    <div className="account-type">
                      <span>Type</span>
                      <strong>{account.type}</strong>
                    </div>
                  </div>
                  <div className="account-card-footer">
                    <button className="btn-small">Voir transactions</button>
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">📊</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== BUDGETS ===== */}
        {activeTab === "budgets" && (
          <div className="budgets-content">
            <div className="content-header">
              <div className="header-left">
                <h2>📋 Gestion budgétaire</h2>
                <span className="header-count">Février 2026</span>
              </div>
              <div className="header-right">
                <button className="btn-secondary">📤 Exporter</button>
                <button className="btn-primary" style={{ background: "#4299e1" }}>
                  + Nouveau budget
                </button>
              </div>
            </div>

            <div className="budgets-summary">
              <div className="budget-summary-card">
                <span>Budget total</span>
                <strong>{formatCurrency(11400)}</strong>
              </div>
              <div className="budget-summary-card">
                <span>Réalisé</span>
                <strong>{formatCurrency(11420)}</strong>
              </div>
              <div className="budget-summary-card">
                <span>Écart</span>
                <strong className="text-danger">{formatCurrency(-20)}</strong>
              </div>
              <div className="budget-summary-card">
                <span>Taux d'exécution</span>
                <strong>100.2%</strong>
              </div>
            </div>

            <div className="table-container">
              <table className="budgets-table">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Budget</th>
                    <th>Réalisé</th>
                    <th>Écart</th>
                    <th>Progression</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.map(budget => {
                    const variance = budget.actual - budget.budget
                    const percentUsed = (budget.actual / budget.budget) * 100
                    return (
                      <tr key={budget.id}>
                        <td className="budget-category">{budget.category}</td>
                        <td>{formatCurrency(budget.budget)}</td>
                        <td>{formatCurrency(budget.actual)}</td>
                        <td className={variance <= 0 ? "text-success" : "text-danger"}>
                          {variance > 0 ? "+" : ""}{formatCurrency(variance)}
                        </td>
                        <td>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar"
                              style={{ 
                                width: `${Math.min(percentUsed, 100)}%`,
                                background: percentUsed > 100 ? "#f56565" : percentUsed > 90 ? "#ed8936" : "#48bb78"
                              }}
                            ></div>
                            <span className="progress-text">{percentUsed.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{
                              background: getStatusBg(budget.status),
                              color: getStatusColor(budget.status)
                            }}
                          >
                            {budget.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn" title="Modifier">✏️</button>
                            <button className="action-btn" title="Voir détails">📊</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== PRÉVISIONS ===== */}
        {activeTab === "forecasts" && (
          <div className="forecasts-content">
            <div className="content-header">
              <div className="header-left">
                <h2>📈 Prévisions financières</h2>
              </div>
              <div className="header-right">
                <button className="btn-secondary">📤 Exporter</button>
                <button className="btn-primary" style={{ background: "#4299e1" }}>
                  Nouvelle prévision
                </button>
              </div>
            </div>

            <div className="forecast-chart-card">
              <div className="card-header">
                <h3>Projection sur 6 mois</h3>
              </div>
              <div className="forecast-bars">
                {forecasts.map((item, index) => (
                  <div key={index} className="forecast-item">
                    <div className="forecast-month">{item.month}</div>
                    <div className="forecast-bars-container">
                      <div className="forecast-bar-revenue" style={{ height: `${(item.revenue / 21000) * 150}px` }}>
                        <span className="forecast-tooltip">{formatCurrency(item.revenue)}</span>
                      </div>
                      <div className="forecast-bar-expenses" style={{ height: `${(item.expenses / 21000) * 150}px` }}>
                        <span className="forecast-tooltip">{formatCurrency(item.expenses)}</span>
                      </div>
                      <div className="forecast-bar-profit" style={{ height: `${(item.profit / 21000) * 150}px` }}>
                        <span className="forecast-tooltip">{formatCurrency(item.profit)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="forecast-metrics">
              <div className="metric-card">
                <h4>Prévision CA annuel</h4>
                <p className="metric-value">{formatCurrency(98790)}</p>
                <span className="metric-trend positive">+15% vs année précédente</span>
              </div>
              <div className="metric-card">
                <h4>Marge prévisionnelle</h4>
                <p className="metric-value">23.5%</p>
                <span className="metric-trend positive">+2.1 pts</span>
              </div>
              <div className="metric-card">
                <h4>Trésorerie prévue</h4>
                <p className="metric-value">{formatCurrency(45230)}</p>
                <span className="metric-trend">Stable</span>
              </div>
              <div className="metric-card">
                <h4>Point mort</h4>
                <p className="metric-value">15 jours</p>
                <span className="metric-trend positive">-3 jours</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== RAPPORTS ===== */}
        {activeTab === "reports" && (
          <div className="reports-content">
            <div className="content-header">
              <div className="header-left">
                <h2>📑 Rapports financiers</h2>
              </div>
            </div>
            <div className="reports-grid">
              <div className="report-card">
                <div className="report-icon" style={{ background: "#4299e115", color: "#4299e1" }}>📊</div>
                <h4>Compte de résultat</h4>
                <p>Période: Février 2026</p>
                <p className="report-amount">{formatCurrency(stats.netProfit)}</p>
                <button className="btn-secondary">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon" style={{ background: "#48bb7815", color: "#48bb78" }}>📈</div>
                <h4>Bilan comptable</h4>
                <p>Arrêté au 28/02/2026</p>
                <p className="report-amount">{formatCurrency(135000)}</p>
                <button className="btn-secondary">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon" style={{ background: "#9f7aea15", color: "#9f7aea" }}>💰</div>
                <h4>Flux de trésorerie</h4>
                <p>Février 2026</p>
                <p className="report-amount">{formatCurrency(2360)}</p>
                <button className="btn-secondary">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon" style={{ background: "#ed893615", color: "#ed8936" }}>📋</div>
                <h4>Analyse budgétaire</h4>
                <p>Écarts et variances</p>
                <p className="report-amount text-danger">-2.3%</p>
                <button className="btn-secondary">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon" style={{ background: "#f5656515", color: "#f56565" }}>⚠️</div>
                <h4>Risques financiers</h4>
                <p>Indicateurs clés</p>
                <p className="report-amount">3 alertes</p>
                <button className="btn-secondary">Télécharger PDF</button>
              </div>
              <div className="report-card">
                <div className="report-icon" style={{ background: "#667eea15", color: "#667eea" }}>📅</div>
                <h4>Prévisions</h4>
                <p>Prochain trimestre</p>
                <p className="report-amount">{formatCurrency(34500)}</p>
                <button className="btn-secondary">Télécharger PDF</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PARAMÈTRES ===== */}
        {activeTab === "settings" && (
          <div className="settings-content">
            <div className="content-header">
              <div className="header-left">
                <h2>⚙️ Paramètres finance</h2>
              </div>
            </div>
            <div className="settings-grid">
              <div className="settings-card">
                <h4>Devise par défaut</h4>
                <p>Euro (EUR)</p>
                <p>Format: 1.234,56 €</p>
                <button className="btn-small">Modifier</button>
              </div>
              <div className="settings-card">
                <h4>Exercice fiscal</h4>
                <p>Début: 01/01/2026</p>
                <p>Fin: 31/12/2026</p>
                <button className="btn-small">Modifier</button>
              </div>
              <div className="settings-card">
                <h4>TVA par défaut</h4>
                <p>Taux normal: 20%</p>
                <p>Taux réduit: 5.5%</p>
                <button className="btn-small">Modifier</button>
              </div>
              <div className="settings-card">
                <h4>Notifications</h4>
                <p>Alertes budget: Activées</p>
                <p>Seuil alerte: 90%</p>
                <button className="btn-small">Modifier</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinanceAdmin
