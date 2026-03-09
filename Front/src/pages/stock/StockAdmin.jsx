// src/pages/stock/StockAdmin.jsx - Version optimisée avec module Fournisseurs
import { useEffect, useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { clearAuth, getUserEmail, getUserRole, isAuthenticated } from "../../utils/auth"
import userService from '../../services/userService'; 
import "./StockAdmin.css"

// ===== CONSTANTES =====
const STATUS={IN_STOCK:"en stock",LOW_STOCK:"stock faible",OUT_OF_STOCK:"rupture"}
const MV={IN:"entrée",OUT:"sortie"}
const TABS={PRODUCTS:"products",CATEGORIES:"categories",MOVEMENTS:"movements",ALERTS:"alerts",REPORTS:"reports",SETTINGS:"settings",SUPPLIERS:"suppliers"}

// ===== DONNÉES INITIALES =====
const IC=[{id:1,name:"Électronique",description:"Produits électroniques",productCount:4},{id:2,name:"Mobilier",description:"Meubles de bureau",productCount:2},{id:3,name:"Accessoires",description:"Accessoires informatiques",productCount:2}]
const IP=[
  {id:1,name:"iPhone 13",category:"Électronique",stock:45,price:899,status:STATUS.IN_STOCK, supplierId:1},
  {id:2,name:"Samsung TV 4K",category:"Électronique",stock:12,price:699,status:STATUS.IN_STOCK, supplierId:2},
  {id:3,name:"Chaise de bureau",category:"Mobilier",stock:8,price:149,status:STATUS.LOW_STOCK, supplierId:3},
  {id:4,name:'Écran 27"',category:"Électronique",stock:0,price:299,status:STATUS.OUT_OF_STOCK, supplierId:2},
  {id:5,name:"Clavier mécanique",category:"Accessoires",stock:23,price:89,status:STATUS.IN_STOCK, supplierId:1},
  {id:6,name:"Souris sans fil",category:"Accessoires",stock:34,price:49,status:STATUS.IN_STOCK, supplierId:1},
  {id:7,name:"Table pliante",category:"Mobilier",stock:5,price:199,status:STATUS.LOW_STOCK, supplierId:3},
  {id:8,name:"Casque audio",category:"Accessoires",stock:18,price:129,status:STATUS.IN_STOCK, supplierId:2}
]
const IM=[
  {id:1,date:"2026-02-10",product:"iPhone 13",productId:1,type:MV.IN,quantity:20,user:"admin@erp.com",note:"Réapprovisionnement"},
  {id:2,date:"2026-02-11",product:"Samsung TV 4K",productId:2,type:MV.OUT,quantity:3,user:"stock@erp.com",note:"Vente client"},
  {id:3,date:"2026-02-11",product:"Chaise de bureau",productId:3,type:MV.IN,quantity:10,user:"stock@erp.com",note:"Nouvelle commande"},
  {id:4,date:"2026-02-12",product:"Clavier mécanique",productId:5,type:MV.OUT,quantity:5,user:"stock@erp.com",note:"Vente en ligne"},
  {id:5,date:"2026-02-12",product:'Écran 27"',productId:4,type:MV.IN,quantity:15,user:"admin@erp.com",note:"Réapprovisionnement"},
  {id:6,date:"2026-02-13",product:"Souris sans fil",productId:6,type:MV.OUT,quantity:8,user:"stock@erp.com",note:"Vente magasin"},
  {id:7,date:"2026-02-13",product:"Casque audio",productId:8,type:MV.IN,quantity:12,user:"admin@erp.com",note:"Nouveau stock"},
  {id:8,date:"2026-02-14",product:"Table pliante",productId:7,type:MV.OUT,quantity:2,user:"stock@erp.com",note:"Vente bureau"}
]

// ===== DONNÉES FOURNISSEURS =====
const IS = [
  {id:1,name:"Tech Distribution",contact:"Jean Dupont",email:"contact@techdistrib.fr",phone:"01 23 45 67 89",address:"15 Rue de l'Innovation, 75001 Paris",products:3,status:"actif",since:"2025-01-15",rating:4.5},
  {id:2,name:"Global Electronics",contact:"Marie Martin",email:"sales@globalelec.com",phone:"01 98 76 54 32",address:"28 Avenue des Champs, 69000 Lyon",products:3,status:"actif",since:"2025-02-20",rating:4.8},
  {id:3,name:"Mobilier Pro",contact:"Pierre Durand",email:"contact@mobilierpro.fr",phone:"03 45 67 89 12",address:"5 Rue du Commerce, 33000 Bordeaux",products:2,status:"actif",since:"2025-03-10",rating:4.2},
  {id:4,name:"Accessoires Direct",contact:"Sophie Bernard",email:"commandes@accessoiresdirect.fr",phone:"04 56 78 91 23",address:"42 Rue de la Logistique, 44000 Nantes",products:0,status:"inactif",since:"2025-04-05",rating:3.5}
]

// ===== COMPOSANTS RÉUTILISABLES =====
const Modal=({isOpen,onClose,title,children,onConfirm,confirmText="Confirmer",showConfirm=true})=>
  !isOpen?null:<div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e=>e.stopPropagation()} role="dialog">
      <div className="modal-header"><h3>{title}</h3><button className="modal-close" onClick={onClose}>×</button></div>
      <div className="modal-body">{children}</div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose}>Annuler</button>
        {showConfirm&&<button className="btn-primary" onClick={onConfirm}>{confirmText}</button>}
      </div>
    </div>
  </div>

const StatusBadge=({status})=>{
  const s={"en stock":{bg:"#c6f6d5",color:"#48bb78"},"stock faible":{bg:"#feebc8",color:"#ed8936"},"rupture":{bg:"#fed7d7",color:"#f56565"}}[status]||{bg:"#e2e8f0",color:"#a0aec0"}
  return <span className="status-badge" style={{background:s.bg,color:s.color}}>{status}</span>
}

const FormField=({label,id,error,children})=>
  <div className="form-group">
    <label htmlFor={id}>{label}</label>{children}{error&&<span className="error-message">{error}</span>}
  </div>

const RatingStars = ({rating}) => {
  const stars = []
  for(let i=1; i<=5; i++) {
    stars.push(
      <span key={i} style={{color: i <= rating ? '#fbbf24' : '#e2e8f0'}}>★</span>
    )
  }
  return <div className="rating-stars">{stars}</div>
}

// ===== COMPOSANT PRINCIPAL =====
function StockAdmin(){
  const n=useNavigate()
  const [ue,setUe]=useState(""),[un,setUn]=useState(""),[ur,setUr]=useState(""),[load,setLoad]=useState(true)
  const [tab,setTab]=useState(TABS.PRODUCTS)
  
  // États paramètres
  const [us,setUs]=useState({firstName:"",lastName:"",email:"",phone:"",department:"",role:"",currentPassword:"",newPassword:"",confirmPassword:""})
  const [sm,setSm]=useState({type:"",text:""}),[upd,setUpd]=useState(false)
  
  // États généraux
  const [mod,setMod]=useState({category:false,product:false,movement:false,categoryProducts:false,supplier:false,supplierProducts:false})
  const [ec,setEc]=useState(null),[ep,setEp]=useState(null),[sc,setSc]=useState(null),[es,setEs]=useState(null)
  const [f,setF]=useState({movement:"all",productName:"",productCategory:"",productStatus:"",date:"",searchProduct:"",startDate:"",endDate:"",supplierName:"",supplierStatus:"",supplierRating:""})
  const [spf,setSpf]=useState(false),[sdp,setSdp]=useState(false)
  
  // Données
  const [cat,setCat]=useState(IC),[prod,setProd]=useState(IP),[mov,setMov]=useState(IM),[supp,setSupp]=useState(IS)
  
  // Formulaires
  const [cf,setCf]=useState({name:"",description:""})
  const [pf,setPf]=useState({name:"",category:"",stock:"",price:"",status:STATUS.IN_STOCK,supplierId:""})
  const [mf,setMf]=useState({productId:"",product:"",type:MV.IN,quantity:"",date:new Date().toISOString().split('T')[0],note:""})
  const [sf,setSf]=useState({name:"",contact:"",email:"",phone:"",address:"",status:"actif",rating:4})
  const [fe,setFe]=useState({})

  // ===== AUTH =====
  useEffect(()=>{
    const role=getUserRole(),email=getUserEmail()
    if(!isAuthenticated()||!["admin_stock","admin_principal"].includes(role)) n("/login")
    else{
      setUr(role);setUe(email);setUn(email?.split('@')[0]||"Stock Manager")
      setUs({firstName:localStorage.getItem('stockFirstName')||"Gestionnaire",lastName:localStorage.getItem('stockLastName')||"Stock",email:email||"",phone:localStorage.getItem('stockPhone')||"",department:localStorage.getItem('stockDepartment')||"Gestion des stocks",role:role||"admin_stock",currentPassword:"",newPassword:"",confirmPassword:""})
      setLoad(false)
    }
  },[n])

  // ===== NAVIGATION =====
  const hdlDash=()=>n("/stock/dashboard")
  const hdlRouter=()=>{if(ur==='admin_principal') n('/admin');else if(ur==='admin_stock') window.scrollTo({top:0,behavior:'smooth'})}
  const hdlLogout=useCallback(()=>{clearAuth();n("/login")},[n])

  // ===== GESTION PARAMÈTRES =====
  const hdlSetChange=e=>{const{name,value}=e.target;setUs({...us,[name]:value})}
  const hdlSave=async()=>{
    if(!us.firstName) return setSm({type:"error",text:"Prénom requis"})
    if(!us.lastName) return setSm({type:"error",text:"Nom requis"})
    if(!us.email) return setSm({type:"error",text:"Email requis"})
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(us.email)) return setSm({type:"error",text:"Email invalide"})
    if(us.phone&&!/^[0-9+\-\s]+$/.test(us.phone)) return setSm({type:"error",text:"Téléphone invalide"})
    
    const cp=us.newPassword||us.confirmPassword||us.currentPassword
    if(cp){
      if(!us.currentPassword) return setSm({type:"error",text:"Mot de passe actuel requis"})
      if(us.newPassword!==us.confirmPassword) return setSm({type:"error",text:"Mots de passe différents"})
      if(us.newPassword.length<6) return setSm({type:"error",text:"Minimum 6 caractères"})
    }
    
    setUpd(true);setSm({type:"info",text:"Mise à jour..."})
    setTimeout(()=>{
      localStorage.setItem('stockFirstName',us.firstName)
      localStorage.setItem('stockLastName',us.lastName)
      localStorage.setItem('stockPhone',us.phone)
      localStorage.setItem('stockDepartment',us.department)
      if(us.email!==ue){localStorage.setItem('userEmail',us.email);setUe(us.email);setUn(us.firstName)}
      else setUn(us.firstName)
      setSm({type:"success",text:"Profil mis à jour !"})
      setTimeout(()=>{setSm({type:"",text:""});setUpd(false)},2000)
    },1500)
  }

  // ===== FILTRES =====
  const fp=useMemo(()=>prod.filter(p=>(!f.productName||p.name.toLowerCase().includes(f.productName.toLowerCase()))&&(!f.productCategory||p.category===f.productCategory)&&(!f.productStatus||p.status===f.productStatus)),[prod,f])
  const fm=useMemo(()=>mov.filter(m=>(f.movement==='all'||m.type===f.movement)&&(!f.date||m.date===f.date)&&(!f.startDate||m.date>=f.startDate)&&(!f.endDate||m.date<=f.endDate)&&(!f.searchProduct||m.product.toLowerCase().includes(f.searchProduct.toLowerCase()))),[mov,f])
  const fs=useMemo(()=>supp.filter(s=>(!f.supplierName||s.name.toLowerCase().includes(f.supplierName.toLowerCase()))&&(!f.supplierStatus||s.status===f.supplierStatus)&&(!f.supplierRating||s.rating>=parseFloat(f.supplierRating))),[supp,f])
  
  const updateFilter=(k,v)=>setF(p=>({...p,[k]:v}))
  const clearFilters=useCallback(()=>setF({movement:"all",productName:"",productCategory:"",productStatus:"",date:"",searchProduct:"",startDate:"",endDate:"",supplierName:"",supplierStatus:"",supplierRating:""}),[])

  // ===== VALIDATIONS =====
  const vCat=useCallback(()=>{
    const e={}
    if(!cf.name.trim()) e.name="Nom requis";else if(cf.name.length>50) e.name="Max 50"
    if(cf.description.length>200) e.description="Max 200"
    return e
  },[cf])
  const vProd=useCallback(()=>{
    const e={}
    if(!pf.name.trim()) e.name="Nom requis";else if(pf.name.length>100) e.name="Max 100"
    if(!pf.category) e.category="Catégorie requise"
    if(!pf.supplierId) e.supplierId="Fournisseur requis"
    if(pf.stock&&parseInt(pf.stock)<0) e.stock="Stock positif"
    if(pf.price&&parseInt(pf.price)<0) e.price="Prix positif"
    return e
  },[pf])
  const vMv=useCallback(()=>{
    const e={}
    if(!mf.productId) e.productId="Produit requis"
    if(!mf.quantity||parseInt(mf.quantity)<=0) e.quantity="Quantité >0"
    if(mf.type===MV.OUT&&mf.productId){const p=prod.find(p=>p.id===mf.productId);if(p&&parseInt(mf.quantity)>p.stock) e.quantity=`Stock insuffisant (${p.stock})`}
    return e
  },[mf,prod])
  const vSupp=useCallback(()=>{
    const e={}
    if(!sf.name.trim()) e.name="Nom requis"
    if(!sf.contact.trim()) e.contact="Contact requis"
    if(!sf.email.trim()) e.email="Email requis"
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sf.email)) e.email="Email invalide"
    if(!sf.phone.trim()) e.phone="Téléphone requis"
    if(sf.rating<1||sf.rating>5) e.rating="Note entre 1 et 5"
    return e
  },[sf])

  // ===== RESET FORMULAIRES =====
  const rCat=useCallback(()=>{setCf({name:"",description:""});setEc(null);setFe({})},[])
  const rProd=useCallback(()=>{setPf({name:"",category:"",stock:"",price:"",status:STATUS.IN_STOCK,supplierId:""});setEp(null);setFe({})},[])
  const rMv=useCallback(()=>{setMf({productId:"",product:"",type:MV.IN,quantity:"",date:new Date().toISOString().split('T')[0],note:""});setFe({})},[])
  const rSupp=useCallback(()=>{setSf({name:"",contact:"",email:"",phone:"",address:"",status:"actif",rating:4});setEs(null);setFe({})},[])

  // ===== CRUD CATÉGORIES =====
  const hdlAddCat=useCallback(()=>{
    const e=vCat();if(Object.keys(e).length)return setFe(e)
    setCat([...cat,{id:cat.length+1,name:cf.name.trim(),description:cf.description.trim(),productCount:0}])
    rCat();setMod(p=>({...p,category:false}))
  },[cat,cf,vCat,rCat])

  const hdlUpdCat=useCallback(()=>{
    const e=vCat();if(Object.keys(e).length)return setFe(e)
    setCat(cat.map(c=>c.id===ec.id?{...c,name:cf.name.trim(),description:cf.description.trim()}:c))
    if(ec.name!==cf.name) setProd(prod.map(p=>p.category===ec.name?{...p,category:cf.name}:p))
    rCat();setMod(p=>({...p,category:false}))
  },[cat,prod,ec,cf,vCat,rCat])

  const hdlDelCat=useCallback((id,name)=>{
    if(window.confirm(prod.filter(p=>p.category===name).length?"Cette catégorie contient des produits. Supprimer ?":"Supprimer ?"))
      setCat(cat.filter(c=>c.id!==id))
  },[prod,cat])

  // ===== CRUD PRODUITS =====
  const updStatus=stock=>stock===0?STATUS.OUT_OF_STOCK:stock<10?STATUS.LOW_STOCK:STATUS.IN_STOCK

  const hdlAddProd=useCallback(()=>{
    const e=vProd();if(Object.keys(e).length)return setFe(e)
    const stock=parseInt(pf.stock)||0
    const newProd={id:prod.length+1,name:pf.name.trim(),category:pf.category,stock,price:parseInt(pf.price)||0,status:updStatus(stock),supplierId:parseInt(pf.supplierId)}
    setProd([...prod,newProd])
    setCat(cat.map(c=>c.name===pf.category?{...c,productCount:c.productCount+1}:c))
    setSupp(supp.map(s=>s.id===parseInt(pf.supplierId)?{...s,products:s.products+1}:s))
    rProd();setMod(p=>({...p,product:false}))
  },[prod,cat,supp,pf,vProd,rProd])

  const hdlUpdProd=useCallback(()=>{
    const e=vProd();if(Object.keys(e).length)return setFe(e)
    const oldProd=prod.find(p=>p.id===ep.id)
    const oldCat=oldProd.category
    const oldSupplier=oldProd.supplierId
    const stock=parseInt(pf.stock)||0
    
    setProd(prod.map(p=>p.id===ep.id?{...ep,name:pf.name.trim(),category:pf.category,stock,price:parseInt(pf.price)||0,status:updStatus(stock),supplierId:parseInt(pf.supplierId)}:p))
    
    // Mise à jour compteurs catégories
    if(oldCat!==pf.category) setCat(cat.map(c=>{
      if(c.name===oldCat) return{...c,productCount:c.productCount-1}
      if(c.name===pf.category) return{...c,productCount:c.productCount+1}
      return c
    }))
    
    // Mise à jour compteurs fournisseurs
    if(oldSupplier!==parseInt(pf.supplierId)) setSupp(supp.map(s=>{
      if(s.id===oldSupplier) return{...s,products:s.products-1}
      if(s.id===parseInt(pf.supplierId)) return{...s,products:s.products+1}
      return s
    }))
    
    rProd();setMod(p=>({...p,product:false}))
  },[prod,cat,supp,ep,pf,vProd,rProd])

  const hdlDelProd=useCallback((id,catName,supplierId)=>{
    if(window.confirm("Supprimer ?")){
      setProd(prod.filter(p=>p.id!==id))
      setCat(cat.map(c=>c.name===catName?{...c,productCount:c.productCount-1}:c))
      setSupp(supp.map(s=>s.id===supplierId?{...s,products:s.products-1}:s))
    }
  },[prod,cat,supp])

  // ===== CRUD MOUVEMENTS =====
  const hdlProdChange=useCallback(e=>{
    const id=parseInt(e.target.value),p=prod.find(p=>p.id===id)
    if(p) setMf(prev=>({...prev,productId:id,product:p.name}))
  },[prod])

  const hdlAddMv=useCallback(()=>{
    const e=vMv();if(Object.keys(e).length)return setFe(e)
    const qty=parseInt(mf.quantity),sel=prod.find(p=>p.id===mf.productId)
    setProd(prod.map(p=>{
      if(p.id!==mf.productId) return p
      const ns=mf.type===MV.IN?p.stock+qty:p.stock-qty
      return{...p,stock:ns,status:updStatus(ns)}
    }))
    setMov([{id:mov.length+1,date:mf.date,product:sel.name,productId:mf.productId,type:mf.type,quantity:qty,user:ue||"stock@erp.com",note:mf.note||""},...mov])
    rMv();setMod(p=>({...p,movement:false}))
  },[prod,mov,mf,ue,vMv,rMv])

  const hdlDelMv=useCallback(id=>{
    if(!window.confirm("Supprimer ?")) return
    const m=mov.find(m=>m.id===id)
    if(m) setProd(prod.map(p=>{
      if(p.id!==m.productId) return p
      const ns=m.type===MV.IN?p.stock-m.quantity:p.stock+m.quantity
      return{...p,stock:ns,status:updStatus(ns)}
    }))
    setMov(mov.filter(m=>m.id!==id))
  },[prod,mov])

  // ===== CRUD FOURNISSEURS =====
  const hdlAddSupp=useCallback(()=>{
    const e=vSupp();if(Object.keys(e).length)return setFe(e)
    setSupp([...supp,{
      id:supp.length+1,
      name:sf.name.trim(),
      contact:sf.contact.trim(),
      email:sf.email.trim(),
      phone:sf.phone.trim(),
      address:sf.address.trim(),
      status:sf.status,
      rating:parseFloat(sf.rating),
      products:0,
      since:new Date().toISOString().split('T')[0]
    }])
    rSupp();setMod(p=>({...p,supplier:false}))
  },[supp,sf,vSupp,rSupp])

  const hdlUpdSupp=useCallback(()=>{
    const e=vSupp();if(Object.keys(e).length)return setFe(e)
    setSupp(supp.map(s=>s.id===es.id?{
      ...s,
      name:sf.name.trim(),
      contact:sf.contact.trim(),
      email:sf.email.trim(),
      phone:sf.phone.trim(),
      address:sf.address.trim(),
      status:sf.status,
      rating:parseFloat(sf.rating)
    }:s))
    rSupp();setMod(p=>({...p,supplier:false}))
  },[supp,es,sf,vSupp,rSupp])

  const hdlDelSupp=useCallback((id)=>{
    const hasProducts = prod.some(p=>p.supplierId===id)
    if(hasProducts){
      if(!window.confirm("Ce fournisseur a des produits associés. Supprimer quand même ?")) return
    } else {
      if(!window.confirm("Supprimer ce fournisseur ?")) return
    }
    setSupp(supp.filter(s=>s.id!==id))
  },[supp,prod])

  // ===== ÉDITION =====
  const hdlEditCat=cat=>{setEc(cat);setCf({name:cat.name,description:cat.description||""});setMod(p=>({...p,category:true}))}
  const hdlEditProd=prod=>{setEp(prod);setPf({name:prod.name,category:prod.category,stock:prod.stock.toString(),price:prod.price.toString(),status:prod.status,supplierId:prod.supplierId});setMod(p=>({...p,product:true}))}
  const hdlEditSupp=supp=>{setEs(supp);setSf({name:supp.name,contact:supp.contact,email:supp.email,phone:supp.phone,address:supp.address||"",status:supp.status,rating:supp.rating});setMod(p=>({...p,supplier:true}))}

  if(load) return <div className="stock-loading"><div className="spinner"></div><p>Chargement...</p></div>

  // ===== MENU =====
  const menu=[
    {id:"dashboard",icon:"📊",label:"Dashboard Stock",isDashboard:true},
    {id:TABS.PRODUCTS,icon:"📦",label:"Produits"},
    {id:TABS.CATEGORIES,icon:"📑",label:"Catégories"},
    {id:TABS.SUPPLIERS,icon:"🤝",label:"Fournisseurs"},
    {id:TABS.MOVEMENTS,icon:"🔄",label:"Mouvements"},
    {id:TABS.ALERTS,icon:"⚠️",label:"Alertes"},
    {id:TABS.REPORTS,icon:"📊",label:"Rapports"},
    {id:TABS.SETTINGS,icon:"⚙️",label:"Paramètres"}
  ]

  return <div className="stock-container">
    {/* Sidebar */}
    <aside className="stock-sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#48bb78"/><path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
          <div><h1>ERP</h1><p>Gestion Stock</p></div>
        </div>
        <span className="role-badge">GESTIONNAIRE STOCK</span>
      </div>

      <div className="user-profile">
        <div className="avatar" style={{background:"linear-gradient(135deg,#48bb78,#2f855a)"}}>{us.firstName?.charAt(0).toUpperCase()||"S"}</div>
        <div className="user-info">
          <div className="user-name">{us.firstName} {us.lastName}</div>
          <div className="user-email">{us.email||"stock@erp.com"}</div>
          {us.department&&<div className="user-department" style={{fontSize:".7rem",color:"#a0aec0"}}>{us.department}</div>}
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-header">
          <p>MENU STOCK</p>
          {ur==='admin_principal'&&<button className="router-button" onClick={hdlRouter} style={{background:'#667eea',color:'#fff',border:'none',borderRadius:'5px',padding:'5px 10px',marginLeft:'10px',cursor:'pointer',fontSize:'.8rem'}} title="Retour à l'administration">🏠 Admin</button>}
        </div>
        <div className="menu-items">
          {menu.map(item=><button key={item.id} className={`menu-item ${tab===item.id?"active":""}`} onClick={()=>{if(item.isDashboard) hdlDash();else setTab(item.id)}}><span className="menu-icon">{item.icon}</span><span>{item.label}</span></button>)}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button onClick={hdlLogout} className="logout-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3C2.46957 3 1.96086 3.21071 1.58579 3.58579C1.21071 3.96086 1 4.46957 1 5V15C1 15.5304 1.21071 16.0391 1.58579 16.4142C1.96086 16.7893 2.46957 17 3 17H8V15H3V5H8V3H3Z"/><path d="M16 5L20 10L16 15L14.59 13.59L17.17 11H8V9H17.17L14.59 6.41L16 5Z"/></svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    {/* Main Content */}
    <main className="stock-main">
      <header className="main-header">
        <div><h1 className="page-title">Gestion des stocks</h1><p className="page-subtitle">Bienvenue sur votre espace de gestion</p></div>
        <div className="header-actions"><time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</time></div>
      </header>

      <section className="tab-content">
        {/* Produits */}
        {tab===TABS.PRODUCTS&&<div className="products-tab">
          <header className="tab-header">
            <h2>📦 Produits</h2>
            <div className="header-buttons">
              <button className="btn-toggle-filters" onClick={()=>setSpf(!spf)}>{spf?"Masquer":"Afficher"} filtres 🔍</button>
              <button className="btn-primary" onClick={()=>{rProd();setMod(p=>({...p,product:true}))}}>+ Nouveau produit</button>
            </div>
          </header>
          
          {spf&&<div className="products-search-bar">
            <div className="search-row">
              <FormField label="🔍 Nom" id="search-name"><input type="text" placeholder="Nom..." value={f.productName} onChange={e=>updateFilter('productName',e.target.value)} className="search-input"/></FormField>
              <FormField label="📑 Catégorie" id="search-cat"><select value={f.productCategory} onChange={e=>updateFilter('productCategory',e.target.value)} className="search-input"><option value="">Toutes</option>{cat.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></FormField>
              <FormField label="📊 Statut" id="search-status"><select value={f.productStatus} onChange={e=>updateFilter('productStatus',e.target.value)} className="search-input"><option value="">Tous</option><option value={STATUS.IN_STOCK}>En stock</option><option value={STATUS.LOW_STOCK}>Stock faible</option><option value={STATUS.OUT_OF_STOCK}>Rupture</option></select></FormField>
              {(f.productName||f.productCategory||f.productStatus)&&<button className="btn-clear-filters" onClick={()=>{updateFilter('productName','');updateFilter('productCategory','');updateFilter('productStatus','')}}>✖ Effacer</button>}
            </div>
            <div className="search-results-info">{fp.length} produit(s)</div>
          </div>}
          
          <div className="products-table-container">
            <table className="products-table">
              <thead><tr><th>Produit</th><th>Catégorie</th><th>Fournisseur</th><th>Stock</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>{fp.length?fp.map(p=><tr key={p.id}>
                <td className="product-name">{p.name}</td>
                <td>{p.category}</td>
                <td>{supp.find(s=>s.id===p.supplierId)?.name || "-"}</td>
                <td className={p.stock===0?"text-danger":p.stock<10?"text-warning":""}><strong>{p.stock}</strong></td>
                <td>{p.price} €</td>
                <td><StatusBadge status={p.status}/></td>
                <td><div className="action-buttons"><button className="btn-icon" onClick={()=>hdlEditProd(p)}>✏️</button><button className="btn-icon" onClick={()=>hdlDelProd(p.id,p.category,p.supplierId)}>🗑️</button></div></td>
              </tr>):<tr><td colSpan="7" className="no-data-row"><div className="no-data-message">Aucun produit</div></td></tr>}</tbody>
            </table>

            <div className="products-table-mobile">{fp.length?fp.map(p=><article key={p.id} className="product-card-mobile">
              <div className="product-card-header"><h3>{p.name}</h3><StatusBadge status={p.status}/></div>
              <div className="product-card-body">
                <div><strong>Catégorie:</strong> {p.category}</div>
                <div><strong>Fournisseur:</strong> {supp.find(s=>s.id===p.supplierId)?.name || "-"}</div>
                <div><strong>Stock:</strong> {p.stock}</div>
                <div><strong>Prix:</strong> {p.price} €</div>
              </div>
              <div className="product-card-footer"><button onClick={()=>hdlEditProd(p)}>✏️</button><button onClick={()=>hdlDelProd(p.id,p.category,p.supplierId)}>🗑️</button></div>
            </article>):<div className="no-data-message">Aucun produit</div>}</div>
          </div>
        </div>}

        {/* Catégories */}
        {tab===TABS.CATEGORIES&&<div className="categories-tab">
          <header className="tab-header"><h2>📑 Catégories</h2><button className="btn-primary" onClick={()=>{rCat();setMod(p=>({...p,category:true}))}}>+ Nouvelle</button></header>
          <div className="categories-grid">{cat.map(c=><article key={c.id} className="category-card"><div className="category-icon">📁</div><div className="category-info"><h3>{c.name}</h3><p>{c.description}</p><div className="category-stats">{c.productCount?<button className="product-count-link" onClick={()=>{setSc(c);setMod(p=>({...p,categoryProducts:true}))}}>📦 <strong>{c.productCount}</strong> produits →</button>:<span>📦 0 produit</span>}</div></div><div className="category-actions"><button className="btn-icon" onClick={()=>hdlEditCat(c)}>✏️</button><button className="btn-icon" onClick={()=>hdlDelCat(c.id,c.name)}>🗑️</button></div></article>)}</div>
        </div>}

        {/* Fournisseurs */}
        {tab===TABS.SUPPLIERS&&<div className="suppliers-tab">
          <header className="tab-header">
            <h2>🤝 Fournisseurs</h2>
            <div className="header-buttons">
              <button className="btn-toggle-filters" onClick={()=>setSpf(!spf)}>{spf?"Masquer":"Afficher"} filtres 🔍</button>
              <button className="btn-primary" onClick={()=>{rSupp();setMod(p=>({...p,supplier:true}))}}>+ Nouveau fournisseur</button>
            </div>
          </header>
          
          {spf&&<div className="suppliers-search-bar">
            <div className="search-row">
              <FormField label="🔍 Nom" id="search-supp-name"><input type="text" placeholder="Nom..." value={f.supplierName} onChange={e=>updateFilter('supplierName',e.target.value)} className="search-input"/></FormField>
              <FormField label="📊 Statut" id="search-supp-status"><select value={f.supplierStatus} onChange={e=>updateFilter('supplierStatus',e.target.value)} className="search-input"><option value="">Tous</option><option value="actif">Actif</option><option value="inactif">Inactif</option></select></FormField>
              <FormField label="⭐ Note min" id="search-supp-rating"><select value={f.supplierRating} onChange={e=>updateFilter('supplierRating',e.target.value)} className="search-input"><option value="">Toutes</option><option value="5">5 étoiles</option><option value="4">4+ étoiles</option><option value="3">3+ étoiles</option></select></FormField>
              {(f.supplierName||f.supplierStatus||f.supplierRating)&&<button className="btn-clear-filters" onClick={()=>{updateFilter('supplierName','');updateFilter('supplierStatus','');updateFilter('supplierRating','')}}>✖ Effacer</button>}
            </div>
            <div className="search-results-info">{fs.length} fournisseur(s)</div>
          </div>}
          
          <div className="suppliers-grid">
            {fs.length?fs.map(s=><article key={s.id} className={`supplier-card ${s.status==='inactif'?'inactive':''}`}>
              <div className="supplier-header">
                <div className="supplier-icon">{s.status==='actif'?'🤝':'🤝'}</div>
                <div className="supplier-status" style={{background:s.status==='actif'?'#c6f6d5':'#fed7d7',color:s.status==='actif'?'#22543d':'#742a2a'}}>
                  {s.status}
                </div>
              </div>
              <div className="supplier-info">
                <h3>{s.name}</h3>
                <div className="supplier-rating"><RatingStars rating={s.rating}/> <span>({s.rating})</span></div>
                <p><strong>Contact:</strong> {s.contact}</p>
                <p><strong>Email:</strong> <a href={`mailto:${s.email}`}>{s.email}</a></p>
                <p><strong>Tél:</strong> {s.phone}</p>
                {s.address&&<p><strong>Adresse:</strong> {s.address}</p>}
                <p><strong>Depuis:</strong> {new Date(s.since).toLocaleDateString('fr-FR')}</p>
                <div className="supplier-products">
                  {s.products?<button className="product-count-link" onClick={()=>{setEs(s);setMod(p=>({...p,supplierProducts:true}))}}>📦 <strong>{s.products}</strong> produits →</button>:<span>📦 Aucun produit</span>}
                </div>
              </div>
              <div className="supplier-actions">
                <button className="btn-icon" onClick={()=>hdlEditSupp(s)}>✏️</button>
                <button className="btn-icon" onClick={()=>hdlDelSupp(s.id)}>🗑️</button>
              </div>
            </article>):<div className="no-data-message">Aucun fournisseur</div>}
          </div>
        </div>}

        {/* Mouvements */}
        {tab===TABS.MOVEMENTS&&<div className="movements-tab">
          <header className="tab-header">
            <h2>🔄 Mouvements</h2>
            <div className="header-buttons"><button className="btn-secondary" onClick={clearFilters}>🧹 Effacer</button><button className="btn-primary" onClick={()=>{rMv();setMod(p=>({...p,movement:true}))}}>+ Nouveau</button></div>
          </header>
          
          <div className="movements-search-bar">
            <div className="search-row">
              <FormField label="Rechercher" id="search-mvmt"><input type="text" placeholder="Produit..." value={f.searchProduct} onChange={e=>updateFilter('searchProduct',e.target.value)} className="search-input"/></FormField>
              <FormField label="Date" id="search-date"><input type="date" value={f.date} onChange={e=>updateFilter('date',e.target.value)} className="search-input"/></FormField>
              <button className="btn-toggle-date" onClick={()=>setSdp(!sdp)}>{sdp?"Masquer":"Afficher"} plage</button>
            </div>
            {sdp&&<div className="date-range-picker"><FormField label="Début" id="start"><input type="date" value={f.startDate} onChange={e=>updateFilter('startDate',e.target.value)} className="search-input"/></FormField><FormField label="Fin" id="end"><input type="date" value={f.endDate} onChange={e=>updateFilter('endDate',e.target.value)} className="search-input"/></FormField></div>}
          </div>

          <div className="movements-filters">
            {[{value:'all',label:'Tous',count:fm.length},{value:MV.IN,label:'Entrées',count:fm.filter(m=>m.type===MV.IN).length},{value:MV.OUT,label:'Sorties',count:fm.filter(m=>m.type===MV.OUT).length}].map(fil=><button key={fil.value} className={`filter-btn ${f.movement===fil.value?'active':''}`} onClick={()=>updateFilter('movement',fil.value)}>{fil.label} ({fil.count})</button>)}
          </div>

          <div className="movements-table-container">
            <table className="movements-table">
              <thead><tr><th>Date</th><th>Produit</th><th>Fournisseur</th><th>Type</th><th>Qté</th><th>Note</th><th>Utilisateur</th><th>Actions</th></tr></thead>
              <tbody>{fm.length?fm.map(m=>{
                const product = prod.find(p=>p.id===m.productId)
                const supplier = product ? supp.find(s=>s.id===product.supplierId) : null
                return <tr key={m.id}>
                  <td><time dateTime={m.date}>{new Date(m.date).toLocaleDateString('fr-FR')}</time></td>
                  <td className="product-name">{m.product}</td>
                  <td>{supplier?.name || '-'}</td>
                  <td><span className={`movement-type ${m.type}`} style={{background:m.type===MV.IN?"#c6f6d5":"#fed7d7",color:m.type===MV.IN?"#22543d":"#742a2a"}}>{m.type===MV.IN?"⬆️ Entrée":"⬇️ Sortie"}</span></td>
                  <td className={m.type===MV.IN?"text-success":"text-danger"}><strong>{m.quantity}</strong></td>
                  <td className="movement-note">{m.note||"-"}</td>
                  <td>{m.user}</td>
                  <td><button className="btn-icon" onClick={()=>hdlDelMv(m.id)}>🗑️</button></td>
                </tr>
              }):<tr><td colSpan="8" className="no-data-row"><div className="no-data-message">Aucun mouvement</div></td></tr>}</tbody>
            </table>
          </div>
        </div>}

        {/* Alertes */}
        {tab===TABS.ALERTS&&<div className="alerts-tab">
          <h2>⚠️ Alertes stock</h2>
          <div className="alerts-container">
            {[{title:"Stock faible",products:prod.filter(p=>p.stock>0&&p.stock<10),icon:"⚠️",action:"Réapprovisionner"},{title:"Rupture",products:prod.filter(p=>p.stock===0),icon:"❌",action:"Commander"}].map(s=><section key={s.title} className="alerts-section"><h3>{s.title}</h3><div className="alerts-list">{s.products.length?s.products.map(p=><article key={p.id} className={`alert-item ${s.title==="Stock faible"?"warning":"danger"}`}><div className="alert-icon">{s.icon}</div><div className="alert-content"><strong>{p.name}</strong><span>{s.title==="Stock faible"?`Stock: ${p.stock}`:"Stock épuisé"}</span><small>Fournisseur: {supp.find(s=>s.id===p.supplierId)?.name || '-'}</small></div><button className="btn-small" onClick={()=>{setMf({productId:p.id,product:p.name,type:MV.IN,quantity:"10",date:new Date().toISOString().split('T')[0],note:s.title==="Stock faible"?"Réapprovisionnement":"Commande"});setMod(prev=>({...prev,movement:true}))}}>{s.action}</button></article>):<p className="no-alerts">Aucun</p>}</div></section>)}
          </div>
        </div>}

        {/* Rapports */}
        {tab===TABS.REPORTS&&<div className="reports-tab">
          <h2>📊 Rapports</h2>
          <div className="reports-grid">
            {[{icon:"📦",title:"État des stocks",desc:"Inventaire complet"},{icon:"🤝",title:"Fournisseurs",desc:"Liste et évaluations"},{icon:"🔄",title:"Mouvements",desc:"Historique"},{icon:"⚠️",title:"Alertes",desc:"Produits sous seuil"},{icon:"💰",title:"Valeur du stock",desc:"Évaluation financière"}].map((r,i)=><article key={i} className="report-card"><div className="report-icon">{r.icon}</div><div className="report-content"><h3>{r.title}</h3><p>{r.desc}</p><button className="btn-outline">PDF</button></div></article>)}
          </div>
        </div>}

        {/* Paramètres */}
        {tab===TABS.SETTINGS&&<div className="settings-tab">
          <h2>⚙️ Paramètres du profil</h2>
          {sm.text&&<div className={`settings-message ${sm.type}`}>{sm.text}</div>}
          <div className="settings-form">
            <div className="settings-section">
              <h3>Informations personnelles</h3>
              <div className="settings-row"><div className="settings-group"><label>Prénom</label><input type="text" name="firstName" value={us.firstName} onChange={hdlSetChange} placeholder="Prénom"/></div><div className="settings-group"><label>Nom</label><input type="text" name="lastName" value={us.lastName} onChange={hdlSetChange} placeholder="Nom"/></div></div>
              <div className="settings-row"><div className="settings-group"><label>Email</label><input type="email" name="email" value={us.email} onChange={hdlSetChange} placeholder="email"/></div><div className="settings-group"><label>Téléphone</label><input type="tel" name="phone" value={us.phone} onChange={hdlSetChange} placeholder=""/></div></div>
            </div>
            <div className="settings-section">
              <h3>Informations professionnelles</h3>
              <div className="settings-row"><div className="settings-group"><label>Département</label><input type="text" name="department" value={us.department} onChange={hdlSetChange} placeholder="Département"/></div><div className="settings-group"><label>Rôle</label><input type="text" value={us.role} disabled style={{backgroundColor:'#f7fafc',cursor:'not-allowed'}}/><small>Rôle non modifiable</small></div></div>
            </div>
            <div className="settings-section">
              <h3>Changer le mot de passe</h3>
              <p className="settings-hint">Laissez vide pour ne pas changer</p>
              <div className="settings-group"><label>Mot de passe actuel</label><input type="password" name="currentPassword" value={us.currentPassword} onChange={hdlSetChange} placeholder=""/></div>
              <div className="settings-row"><div className="settings-group"><label>Nouveau</label><input type="password" name="newPassword" value={us.newPassword} onChange={hdlSetChange} placeholder=""/></div><div className="settings-group"><label>Confirmer</label><input type="password" name="confirmPassword" value={us.confirmPassword} onChange={hdlSetChange} placeholder=""/></div></div>
              <small>Minimum 6 caractères</small>
            </div>
            <div className="settings-actions"><button className="btn-primary" onClick={hdlSave} disabled={upd}>{upd?"Mise à jour...":"Enregistrer"}</button></div>
          </div>
        </div>}
      </section>
    </main>

    {/* Modales */}
    <Modal isOpen={mod.category} onClose={()=>{setMod(p=>({...p,category:false}));rCat()}} title={ec?'✏️ Modifier':'➕ Nouvelle catégorie'} onConfirm={ec?hdlUpdCat:hdlAddCat} confirmText={ec?'Modifier':'Créer'}>
      <FormField label="Nom" id="cat-name" error={fe.name}><input type="text" value={cf.name} onChange={e=>setCf({...cf,name:e.target.value})} autoFocus/></FormField>
      <FormField label="Description" id="cat-desc" error={fe.description}><textarea value={cf.description} onChange={e=>setCf({...cf,description:e.target.value})} rows="3"/></FormField>
    </Modal>

    <Modal isOpen={mod.product} onClose={()=>{setMod(p=>({...p,product:false}));rProd()}} title={ep?'✏️ Modifier':'➕ Nouveau produit'} onConfirm={ep?hdlUpdProd:hdlAddProd} confirmText={ep?'Modifier':'Ajouter'}>
      <FormField label="Nom" id="prod-name" error={fe.name}><input type="text" value={pf.name} onChange={e=>setPf({...pf,name:e.target.value})} autoFocus/></FormField>
      <FormField label="Catégorie" id="prod-cat" error={fe.category}><select value={pf.category} onChange={e=>setPf({...pf,category:e.target.value})}><option value="">Sélectionner</option>{cat.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></FormField>
      <FormField label="Fournisseur" id="prod-supplier" error={fe.supplierId}><select value={pf.supplierId} onChange={e=>setPf({...pf,supplierId:e.target.value})}><option value="">Sélectionner</option>{supp.filter(s=>s.status==='actif').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></FormField>
      <div className="form-row"><FormField label="Stock" id="prod-stock" error={fe.stock}><input type="number" min="0" value={pf.stock} onChange={e=>setPf({...pf,stock:e.target.value})}/></FormField><FormField label="Prix (€)" id="prod-price" error={fe.price}><input type="number" min="0" value={pf.price} onChange={e=>setPf({...pf,price:e.target.value})}/></FormField></div>
    </Modal>

    <Modal isOpen={mod.movement} onClose={()=>{setMod(p=>({...p,movement:false}));rMv()}} title="➕ Nouveau mouvement" onConfirm={hdlAddMv} confirmText="Ajouter">
      <FormField label="Produit" id="mvmt-prod" error={fe.productId}><select value={mf.productId} onChange={hdlProdChange}><option value="">Sélectionner</option>{prod.map(p=><option key={p.id} value={p.id}>{p.name} ({p.stock}) - {supp.find(s=>s.id===p.supplierId)?.name}</option>)}</select></FormField>
      <div className="form-row"><FormField label="Type" id="mvmt-type"><select value={mf.type} onChange={e=>setMf({...mf,type:e.target.value})}><option value={MV.IN}>⬆️ Entrée</option><option value={MV.OUT}>⬇️ Sortie</option></select></FormField><FormField label="Quantité" id="mvmt-qty" error={fe.quantity}><input type="number" min="1" value={mf.quantity} onChange={e=>setMf({...mf,quantity:e.target.value})}/></FormField></div>
      <FormField label="Date" id="mvmt-date"><input type="date" value={mf.date} onChange={e=>setMf({...mf,date:e.target.value})}/></FormField>
      <FormField label="Note" id="mvmt-note"><textarea value={mf.note} onChange={e=>setMf({...mf,note:e.target.value})} rows="2"/></FormField>
      {mf.productId&&mf.type===MV.OUT&&<div className="stock-warning">⚠️ Stock: {prod.find(p=>p.id===mf.productId)?.stock}</div>}
    </Modal>

    <Modal isOpen={mod.supplier} onClose={()=>{setMod(p=>({...p,supplier:false}));rSupp()}} title={es?'✏️ Modifier fournisseur':'➕ Nouveau fournisseur'} onConfirm={es?hdlUpdSupp:hdlAddSupp} confirmText={es?'Modifier':'Ajouter'}>
      <FormField label="Nom entreprise" id="supp-name" error={fe.name}><input type="text" value={sf.name} onChange={e=>setSf({...sf,name:e.target.value})} autoFocus/></FormField>
      <FormField label="Personne de contact" id="supp-contact" error={fe.contact}><input type="text" value={sf.contact} onChange={e=>setSf({...sf,contact:e.target.value})}/></FormField>
      <div className="form-row">
        <FormField label="Email" id="supp-email" error={fe.email}><input type="email" value={sf.email} onChange={e=>setSf({...sf,email:e.target.value})}/></FormField>
        <FormField label="Téléphone" id="supp-phone" error={fe.phone}><input type="tel" value={sf.phone} onChange={e=>setSf({...sf,phone:e.target.value})}/></FormField>
      </div>
      <FormField label="Adresse" id="supp-address"><textarea value={sf.address} onChange={e=>setSf({...sf,address:e.target.value})} rows="2"/></FormField>
      <div className="form-row">
        <FormField label="Statut" id="supp-status"><select value={sf.status} onChange={e=>setSf({...sf,status:e.target.value})}><option value="actif">Actif</option><option value="inactif">Inactif</option></select></FormField>
        <FormField label="Note (1-5)" id="supp-rating" error={fe.rating}><input type="number" min="1" max="5" step="0.1" value={sf.rating} onChange={e=>setSf({...sf,rating:e.target.value})}/></FormField>
      </div>
    </Modal>

    <Modal isOpen={mod.categoryProducts} onClose={()=>setMod(p=>({...p,categoryProducts:false}))} title={`📁 ${sc?.name}`} showConfirm={false}>
      {sc&&<><div className="category-info-header"><p>{sc.description}</p><p><strong>{sc.productCount}</strong> produit(s)</p></div><div className="category-products-list">{prod.filter(p=>p.category===sc.name).length?<table className="products-table"><thead><tr><th>Produit</th><th>Fournisseur</th><th>Stock</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{prod.filter(p=>p.category===sc.name).map(p=><tr key={p.id}>
        <td className="product-name">{p.name}</td>
        <td>{supp.find(s=>s.id===p.supplierId)?.name || '-'}</td>
        <td className={p.stock===0?"text-danger":p.stock<10?"text-warning":""}><strong>{p.stock}</strong></td>
        <td>{p.price} €</td>
        <td><StatusBadge status={p.status}/></td>
        <td><button className="btn-icon" onClick={()=>{setMod(p=>({...p,categoryProducts:false}));hdlEditProd(p)}}>✏️</button></td>
      </tr>)}</tbody></table>:<div className="no-data-message">Aucun produit</div>}</div><div className="modal-footer-extra"><button className="btn-primary" onClick={()=>{setMod(p=>({...p,categoryProducts:false}));setTab(TABS.PRODUCTS);updateFilter('productCategory',sc.name);setSpf(true)}}>Voir dans Produits</button></div></>}
    </Modal>

    <Modal isOpen={mod.supplierProducts} onClose={()=>setMod(p=>({...p,supplierProducts:false}))} title={`🤝 ${es?.name}`} showConfirm={false}>
      {es&&<><div className="supplier-info-header">
        <p><strong>Contact:</strong> {es.contact} | {es.email} | {es.phone}</p>
        <p><strong>Note:</strong> <RatingStars rating={es.rating}/> ({es.rating})</p>
        <p><strong>{es.products}</strong> produit(s) fourni(s)</p>
      </div><div className="supplier-products-list">{prod.filter(p=>p.supplierId===es.id).length?<table className="products-table"><thead><tr><th>Produit</th><th>Catégorie</th><th>Stock</th><th>Prix</th><th>Statut</th><th>Actions</th></tr></thead><tbody>{prod.filter(p=>p.supplierId===es.id).map(p=><tr key={p.id}>
        <td className="product-name">{p.name}</td>
        <td>{p.category}</td>
        <td className={p.stock===0?"text-danger":p.stock<10?"text-warning":""}><strong>{p.stock}</strong></td>
        <td>{p.price} €</td>
        <td><StatusBadge status={p.status}/></td>
        <td><button className="btn-icon" onClick={()=>{setMod(p=>({...p,supplierProducts:false}));hdlEditProd(p)}}>✏️</button></td>
      </tr>)}</tbody></table>:<div className="no-data-message">Aucun produit de ce fournisseur</div>}</div><div className="modal-footer-extra"><button className="btn-primary" onClick={()=>{setMod(p=>({...p,supplierProducts:false}));setTab(TABS.PRODUCTS);updateFilter('productName','');setSpf(false)}}>Voir tous les produits</button></div></>}
    </Modal>
  </div>
}

export default StockAdmin