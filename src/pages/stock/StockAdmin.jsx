// src/pages/dashboard/stock/StockAdmin.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { clearAuth, getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"
import "./StockAdmin.css"

function StockAdmin() {
  const navigate = useNavigate()
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)

  // Données des catégories
  const [categories, setCategories] = useState([
    { id: 1, name: "Électronique", description: "Produits électroniques", productCount: 4 },
    { id: 2, name: "Mobilier", description: "Meubles de bureau", productCount: 2 },
    { id: 3, name: "Accessoires", description: "Accessoires informatiques", productCount: 2 }
  ])

  // Données des produits
  const [products, setProducts] = useState([
    { id: 1, name: "iPhone 13", category: "Électronique", stock: 45, price: 899, status: "en stock" },
    { id: 2, name: "Samsung TV 4K", category: "Électronique", stock: 12, price: 699, status: "en stock" },
    { id: 3, name: "Chaise de bureau", category: "Mobilier", stock: 8, price: 149, status: "stock faible" },
    { id: 4, name: "Écran 27\"", category: "Électronique", stock: 0, price: 299, status: "rupture" },
    { id: 5, name: "Clavier mécanique", category: "Accessoires", stock: 23, price: 89, status: "en stock" },
    { id: 6, name: "Souris sans fil", category: "Accessoires", stock: 34, price: 49, status: "en stock" },
    { id: 7, name: "Table pliante", category: "Mobilier", stock: 5, price: 199, status: "stock faible" },
    { id: 8, name: "Casque audio", category: "Accessoires", stock: 18, price: 129, status: "en stock" }
  ])

  // Données des mouvements de stock
  const [movements, setMovements] = useState([
    { id: 1, date: "2026-02-10", product: "iPhone 13", type: "entrée", quantity: 20, user: "admin@erp.com" },
    { id: 2, date: "2026-02-11", product: "Samsung TV 4K", type: "sortie", quantity: 3, user: "stock@erp.com" },
    { id: 3, date: "2026-02-11", product: "Chaise de bureau", type: "entrée", quantity: 10, user: "stock@erp.com" },
    { id: 4, date: "2026-02-12", product: "Clavier mécanique", type: "sortie", quantity: 5, user: "stock@erp.com" },
    { id: 5, date: "2026-02-12", product: "Écran 27\"", type: "entrée", quantity: 15, user: "admin@erp.com" }
  ])

  // Nouvelle catégorie / Édition
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })

  // Nouveau produit / Édition
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    status: "en stock"
  })

  // Statistiques
  const stats = {
    totalProducts: products.length,
    totalStock: products.reduce((acc, p) => acc + p.stock, 0),
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((acc, p) => acc + (p.stock * p.price), 0)
  }

  useEffect(() => {
    const role = getUserRole()
    const email = getUserEmail()
    
    if (!isAuthenticated() || role !== "admin_stock") {
      navigate("/login")
    } else {
      setUserEmail(email)
      setUserName(email?.split('@')[0] || "Stock Manager")
      setLoading(false)
    }
  }, [navigate])

  // Gestion des catégories
  const handleAddCategory = () => {
    if (categoryForm.name.trim()) {
      const category = {
        id: categories.length + 1,
        name: categoryForm.name,
        description: categoryForm.description,
        productCount: 0
      }
      setCategories([...categories, category])
      resetCategoryForm()
      setShowCategoryModal(false)
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryForm({ name: category.name, description: category.description })
    setShowCategoryModal(true)
  }

  const handleUpdateCategory = () => {
    if (categoryForm.name.trim()) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryForm.name, description: categoryForm.description }
          : cat
      ))
      
      // Mettre à jour les produits avec l'ancien nom de catégorie
      if (editingCategory.name !== categoryForm.name) {
        setProducts(products.map(product => 
          product.category === editingCategory.name
            ? { ...product, category: categoryForm.name }
            : product
        ))
      }
      
      resetCategoryForm()
      setShowCategoryModal(false)
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = (categoryId, categoryName) => {
    // Vérifier si des produits utilisent cette catégorie
    const productsInCategory = products.filter(p => p.category === categoryName)
    
    if (productsInCategory.length > 0) {
      if (window.confirm(`Cette catégorie contient ${productsInCategory.length} produit(s). Êtes-vous sûr de vouloir la supprimer ? Les produits seront déplacés dans "Non catégorisé".`)) {
        // Déplacer les produits vers "Non catégorisé"
        setProducts(products.map(product => 
          product.category === categoryName
            ? { ...product, category: "Non catégorisé" }
            : product
        ))
        
        // Supprimer la catégorie
        setCategories(categories.filter(cat => cat.id !== categoryId))
        
        // Ajouter "Non catégorisé" si nécessaire
        if (!categories.some(cat => cat.name === "Non catégorisé")) {
          setCategories([...categories.filter(cat => cat.id !== categoryId), {
            id: categories.length + 1,
            name: "Non catégorisé",
            description: "Produits sans catégorie",
            productCount: productsInCategory.length
          }])
        }
      }
    } else {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
        setCategories(categories.filter(cat => cat.id !== categoryId))
      }
    }
  }

  // Gestion des produits
  const handleAddProduct = () => {
    if (productForm.name.trim() && productForm.category) {
      const product = {
        id: products.length + 1,
        name: productForm.name,
        category: productForm.category,
        stock: parseInt(productForm.stock) || 0,
        price: parseInt(productForm.price) || 0,
        status: parseInt(productForm.stock) === 0 ? "rupture" : 
                parseInt(productForm.stock) < 10 ? "stock faible" : "en stock"
      }
      setProducts([...products, product])
      
      // Mettre à jour le compteur de produits dans la catégorie
      setCategories(categories.map(cat => 
        cat.name === productForm.category 
          ? {...cat, productCount: cat.productCount + 1} 
          : cat
      ))
      
      resetProductForm()
      setShowProductModal(false)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      category: product.category,
      stock: product.stock.toString(),
      price: product.price.toString(),
      status: product.status
    })
    setShowProductModal(true)
  }

  const handleUpdateProduct = () => {
    if (productForm.name.trim() && productForm.category) {
      const oldCategory = products.find(p => p.id === editingProduct.id).category
      const newCategory = productForm.category
      
      const updatedProduct = {
        ...editingProduct,
        name: productForm.name,
        category: newCategory,
        stock: parseInt(productForm.stock) || 0,
        price: parseInt(productForm.price) || 0,
        status: parseInt(productForm.stock) === 0 ? "rupture" : 
                parseInt(productForm.stock) < 10 ? "stock faible" : "en stock"
      }
      
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p))
      
      // Mettre à jour les compteurs de catégories si la catégorie a changé
      if (oldCategory !== newCategory) {
        setCategories(categories.map(cat => {
          if (cat.name === oldCategory) {
            return { ...cat, productCount: cat.productCount - 1 }
          }
          if (cat.name === newCategory) {
            return { ...cat, productCount: cat.productCount + 1 }
          }
          return cat
        }))
      }
      
      resetProductForm()
      setShowProductModal(false)
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (productId, productCategory) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setProducts(products.filter(p => p.id !== productId))
      
      // Mettre à jour le compteur de la catégorie
      setCategories(categories.map(cat => 
        cat.name === productCategory 
          ? {...cat, productCount: cat.productCount - 1} 
          : cat
      ))
    }
  }

  // Handlers pour les mouvements de stock
  const handleStockIn = (productId) => {
    const product = products.find(p => p.id === productId)
    const quantity = prompt(`Quantité à ajouter pour ${product.name}:`, "1")
    
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
      const newQuantity = parseInt(quantity)
      
      // Mettre à jour le produit
      setProducts(products.map(p => {
        if (p.id === productId) {
          const newStock = p.stock + newQuantity
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? "rupture" : newStock < 10 ? "stock faible" : "en stock"
          }
        }
        return p
      }))
      
      // Ajouter le mouvement
      const newMovement = {
        id: movements.length + 1,
        date: new Date().toISOString().split('T')[0],
        product: product.name,
        type: "entrée",
        quantity: newQuantity,
        user: userEmail || "stock@erp.com"
      }
      setMovements([newMovement, ...movements])
    }
  }

  const handleStockOut = (productId) => {
    const product = products.find(p => p.id === productId)
    const quantity = prompt(`Quantité à retirer pour ${product.name}:`, "1")
    
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
      const newQuantity = parseInt(quantity)
      
      if (product.stock - newQuantity < 0) {
        alert("Stock insuffisant !")
        return
      }
      
      // Mettre à jour le produit
      setProducts(products.map(p => {
        if (p.id === productId) {
          const newStock = p.stock - newQuantity
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? "rupture" : newStock < 10 ? "stock faible" : "en stock"
          }
        }
        return p
      }))
      
      // Ajouter le mouvement
      const newMovement = {
        id: movements.length + 1,
        date: new Date().toISOString().split('T')[0],
        product: product.name,
        type: "sortie",
        quantity: newQuantity,
        user: userEmail || "stock@erp.com"
      }
      setMovements([newMovement, ...movements])
    }
  }

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "" })
    setEditingCategory(null)
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      category: "",
      stock: "",
      price: "",
      status: "en stock"
    })
    setEditingProduct(null)
  }

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  const getStatusColor = (status) => {
    switch(status) {
      case "en stock": return "#48bb78"
      case "stock faible": return "#ed8936"
      case "rupture": return "#f56565"
      default: return "#a0aec0"
    }
  }

  const getStatusBg = (status) => {
    switch(status) {
      case "en stock": return "#c6f6d5"
      case "stock faible": return "#feebc8"
      case "rupture": return "#fed7d7"
      default: return "#e2e8f0"
    }
  }

  if (loading) {
    return (
      <div className="stock-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="stock-container">
      {/* ===== SIDEBAR GAUCHE ===== */}
      <div className="stock-sidebar">
        {/* En-tête */}
        <div className="sidebar-header">
          <div className="logo-container">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#48bb78"/>
              <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <div>
              <h1>ERP</h1>
              <p>Gestion Stock</p>
            </div>
          </div>
          <span className="role-badge">
            GESTIONNAIRE STOCK
          </span>
        </div>

        {/* Profil utilisateur */}
        <div className="user-profile">
          <div className="avatar" style={{ background: "linear-gradient(135deg, #48bb78, #2f855a)" }}>
            S
          </div>
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-email">{userEmail || "stock@erp.com"}</div>
          </div>
        </div>

        {/* Menu principal */}
        <div className="sidebar-menu">
          <div className="menu-header">
            <p>MENU STOCK</p>
          </div>
          
          <div className="menu-items">
            <div 
              className={`menu-item ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <span className="menu-icon">📦</span>
              <span>Produits</span>
            </div>
            <div 
              className={`menu-item ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              <span className="menu-icon">📑</span>
              <span>Catégories</span>
            </div>
            <div 
              className={`menu-item ${activeTab === "movements" ? "active" : ""}`}
              onClick={() => setActiveTab("movements")}
            >
              <span className="menu-icon">🔄</span>
              <span>Mouvements</span>
            </div>
            <div 
              className={`menu-item ${activeTab === "alerts" ? "active" : ""}`}
              onClick={() => setActiveTab("alerts")}
            >
              <span className="menu-icon">⚠️</span>
              <span>Alertes</span>
              {stats.lowStock + stats.outOfStock > 0 && (
                <span className="alert-badge">{stats.lowStock + stats.outOfStock}</span>
              )}
            </div>
            <div 
              className={`menu-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <span className="menu-icon">📊</span>
              <span>Rapports</span>
            </div>
          </div>
        </div>

        {/* Bouton de déconnexion en bas */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3C2.46957 3 1.96086 3.21071 1.58579 3.58579C1.21071 3.96086 1 4.46957 1 5V15C1 15.5304 1.21071 16.0391 1.58579 16.4142C1.96086 16.7893 2.46957 17 3 17H8V15H3V5H8V3H3Z" />
              <path d="M16 5L20 10L16 15L14.59 13.59L17.17 11H8V9H17.17L14.59 6.41L16 5Z" />
            </svg>
            Déconnexion
          </button>
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="stock-main">
        {/* En-tête */}
        <div className="main-header">
          <div>
            <h2 className="page-title">Gestion des stocks</h2>
            <p className="page-subtitle">Bienvenue sur votre espace de gestion</p>
          </div>
          <div className="header-actions">
            <span className="date-display">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#48bb7815", color: "#48bb78" }}>📦</div>
            <div className="stat-content">
              <h4>Produits</h4>
              <p className="stat-value">{stats.totalProducts}</p>
              <span>Total articles</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#4299e115", color: "#4299e1" }}>📊</div>
            <div className="stat-content">
              <h4>Stock total</h4>
              <p className="stat-value">{stats.totalStock}</p>
              <span>Unités</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#ed893615", color: "#ed8936" }}>⚠️</div>
            <div className="stat-content">
              <h4>Stock faible</h4>
              <p className="stat-value">{stats.lowStock}</p>
              <span>Produits</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "#f5656515", color: "#f56565" }}>❌</div>
            <div className="stat-content">
              <h4>Rupture</h4>
              <p className="stat-value">{stats.outOfStock}</p>
              <span>Produits</span>
            </div>
          </div>
          <div className="stat-card stat-card-large">
            <div className="stat-icon" style={{ background: "#9f7aea15", color: "#9f7aea" }}>💰</div>
            <div className="stat-content">
              <h4>Valeur totale</h4>
              <p className="stat-value">{stats.totalValue.toLocaleString()} €</p>
              <span>Stock</span>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="tab-content">
          {/* Onglet Produits */}
          {activeTab === "products" && (
            <div className="products-tab">
              <div className="tab-header">
                <h3>📦 Liste des produits</h3>
                <div className="header-buttons">
                  <button className="btn-secondary" onClick={() => {
                    resetCategoryForm()
                    setShowCategoryModal(true)
                  }}>
                    + Nouvelle catégorie
                  </button>
                  <button className="btn-primary" onClick={() => {
                    resetProductForm()
                    setShowProductModal(true)
                  }}>
                    + Nouveau produit
                  </button>
                </div>
              </div>
              
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Catégorie</th>
                      <th>Stock</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="product-name">{product.name}</td>
                        <td>{product.category}</td>
                        <td className={product.stock === 0 ? "text-danger" : product.stock < 10 ? "text-warning" : ""}>
                          <strong>{product.stock}</strong> unités
                        </td>
                        <td>{product.price} €</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{
                              background: getStatusBg(product.status),
                              color: getStatusColor(product.status)
                            }}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon" title="Modifier" onClick={() => handleEditProduct(product)}>✏️</button>
                          <button className="btn-icon" title="Entrée stock" onClick={() => handleStockIn(product.id)}>📥</button>
                          <button className="btn-icon" title="Sortie stock" onClick={() => handleStockOut(product.id)}>📤</button>
                          <button className="btn-icon" title="Supprimer" onClick={() => handleDeleteProduct(product.id, product.category)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer avec date et valeur totale */}
              <div className="stock-footer">
                <div className="stock-footer-left">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="stock-footer-right">
                  <span className="footer-label">Valeur totale</span>
                  <span className="footer-value">{stats.totalValue.toLocaleString()} €</span>
                  <span className="footer-label">Stock</span>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Catégories */}
          {activeTab === "categories" && (
            <div className="categories-tab">
              <div className="tab-header">
                <h3>📑 Gestion des catégories</h3>
                <button className="btn-primary" onClick={() => {
                  resetCategoryForm()
                  setShowCategoryModal(true)
                }}>
                  + Nouvelle catégorie
                </button>
              </div>
              
              <div className="categories-grid">
                {categories.map(category => (
                  <div key={category.id} className="category-card">
                    <div className="category-icon">📁</div>
                    <div className="category-info">
                      <h4>{category.name}</h4>
                      <p>{category.description}</p>
                      <span className="product-count">{category.productCount} produits</span>
                    </div>
                    <div className="category-actions">
                      <button className="btn-icon" title="Modifier" onClick={() => handleEditCategory(category)}>✏️</button>
                      <button className="btn-icon" title="Supprimer" onClick={() => handleDeleteCategory(category.id, category.name)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Mouvements */}
          {activeTab === "movements" && (
            <div className="movements-tab">
              <div className="tab-header">
                <h3>🔄 Historique des mouvements</h3>
              </div>
              
              <div className="movements-table-container">
                <table className="movements-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Produit</th>
                      <th>Type</th>
                      <th>Quantité</th>
                      <th>Utilisateur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map(movement => (
                      <tr key={movement.id}>
                        <td>{new Date(movement.date).toLocaleDateString('fr-FR')}</td>
                        <td className="product-name">{movement.product}</td>
                        <td>
                          <span 
                            className={`movement-type ${movement.type}`}
                            style={{
                              background: movement.type === "entrée" ? "#c6f6d5" : "#fed7d7",
                              color: movement.type === "entrée" ? "#22543d" : "#742a2a"
                            }}
                          >
                            {movement.type === "entrée" ? "⬆️ Entrée" : "⬇️ Sortie"}
                          </span>
                        </td>
                        <td className={movement.type === "entrée" ? "text-success" : "text-danger"}>
                          <strong>{movement.quantity}</strong>
                        </td>
                        <td>{movement.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Alertes */}
          {activeTab === "alerts" && (
            <div className="alerts-tab">
              <h3>⚠️ Alertes stock</h3>
              
              <div className="alerts-container">
                <div className="alerts-section">
                  <h4>Stock faible ({stats.lowStock})</h4>
                  <div className="alerts-list">
                    {products.filter(p => p.stock > 0 && p.stock < 10).map(product => (
                      <div key={product.id} className="alert-item warning">
                        <div className="alert-icon">⚠️</div>
                        <div className="alert-content">
                          <strong>{product.name}</strong>
                          <span>Stock: {product.stock} unités</span>
                          <span>Seuil minimum: 10</span>
                        </div>
                        <button className="btn-small" onClick={() => handleStockIn(product.id)}>Réapprovisionner</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="alerts-section">
                  <h4>Rupture de stock ({stats.outOfStock})</h4>
                  <div className="alerts-list">
                    {products.filter(p => p.stock === 0).map(product => (
                      <div key={product.id} className="alert-item danger">
                        <div className="alert-icon">❌</div>
                        <div className="alert-content">
                          <strong>{product.name}</strong>
                          <span>Stock épuisé</span>
                        </div>
                        <button className="btn-small" onClick={() => handleStockIn(product.id)}>Commander</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Rapports */}
          {activeTab === "reports" && (
            <div className="reports-tab">
              <h3>📊 Rapports</h3>
              
              <div className="reports-grid">
                <div className="report-card">
                  <div className="report-icon">📦</div>
                  <div className="report-content">
                    <h4>État des stocks</h4>
                    <p>Rapport complet de l'inventaire</p>
                    <button className="btn-outline">Télécharger PDF</button>
                  </div>
                </div>
                <div className="report-card">
                  <div className="report-icon">🔄</div>
                  <div className="report-content">
                    <h4>Mouvements</h4>
                    <p>Historique des entrées/sorties</p>
                    <button className="btn-outline">Télécharger PDF</button>
                  </div>
                </div>
                <div className="report-card">
                  <div className="report-icon">⚠️</div>
                  <div className="report-content">
                    <h4>Alertes</h4>
                    <p>Produits sous seuil critique</p>
                    <button className="btn-outline">Télécharger PDF</button>
                  </div>
                </div>
                <div className="report-card">
                  <div className="report-icon">💰</div>
                  <div className="report-content">
                    <h4>Valeur du stock</h4>
                    <p>Évaluation financière</p>
                    <button className="btn-outline">Télécharger PDF</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Catégorie (Ajout/Modification) */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCategoryModal(false)
          resetCategoryForm()
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? '✏️ Modifier la catégorie' : '➕ Nouvelle catégorie'}</h3>
              <button className="modal-close" onClick={() => {
                setShowCategoryModal(false)
                resetCategoryForm()
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom de la catégorie</label>
                <input
                  type="text"
                  placeholder="Ex: Électronique"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Description de la catégorie"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowCategoryModal(false)
                resetCategoryForm()
              }}>Annuler</button>
              <button 
                className="btn-primary" 
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
              >
                {editingCategory ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Produit (Ajout/Modification) */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => {
          setShowProductModal(false)
          resetProductForm()
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? '✏️ Modifier le produit' : '➕ Nouveau produit'}</h3>
              <button className="modal-close" onClick={() => {
                setShowProductModal(false)
                resetProductForm()
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom du produit</label>
                <input
                  type="text"
                  placeholder="Ex: iPhone 14"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock (unités)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Prix (€)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowProductModal(false)
                resetProductForm()
              }}>Annuler</button>
              <button 
                className="btn-primary" 
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
              >
                {editingProduct ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockAdmin
