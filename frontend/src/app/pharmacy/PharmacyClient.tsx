'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Pill, 
  Search, 
  Filter, 
  Heart, 
  Star, 
  Upload, 
  TrendingUp, 
  Clock, 
  Shield, 
  Truck, 
  CheckCircle, 
  AlertCircle,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Sparkles,
  Zap,
  Target,
  Award,
  Plus,
  Minus,
  Eye,
  ShoppingBag,
  User,
  Home,
  Calendar,
  Activity
} from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  genericName: string
  strength: string
  form: string
  price: number
  originalPrice?: number
  rxRequired: boolean
  inStock: boolean
  category: string
  rating: number
  reviews: number
  discount?: number
  isPopular?: boolean
  fastDelivery?: boolean
  imageUrl?: string
}

interface CartItem {
  productId: string
  quantity: number
  product: Product
}

export default function PharmacyClient() {
  const [activeTab, setActiveTab] = useState('browse') // browse, cart, orders, prescription
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false)
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false)

  // Mock products data
  const products: Product[] = [
    {
      id: '1',
      name: 'Paracetamol',
      brand: 'Napa',
      genericName: 'Paracetamol',
      strength: '500mg',
      form: 'Tablet',
      price: 3.50,
      originalPrice: 4.00,
      rxRequired: false,
      inStock: true,
      category: 'Pain Relief',
      rating: 4.5,
      reviews: 234,
      discount: 12,
      isPopular: true,
      fastDelivery: true
    },
    {
      id: '2',
      name: 'Amoxicillin',
      brand: 'Amoxil',
      genericName: 'Amoxicillin',
      strength: '250mg',
      form: 'Capsule',
      price: 8.99,
      rxRequired: true,
      inStock: true,
      category: 'Antibiotics',
      rating: 4.7,
      reviews: 156,
      fastDelivery: true
    },
    {
      id: '3',
      name: 'Cetirizine',
      brand: 'Zyrtec',
      genericName: 'Cetirizine HCI',
      strength: '10mg',
      form: 'Tablet',
      price: 4.20,
      originalPrice: 5.00,
      rxRequired: false,
      inStock: true,
      category: 'Cold & Allergy',
      rating: 4.3,
      reviews: 89,
      discount: 16,
      isPopular: true
    },
    {
      id: '4',
      name: 'Metformin',
      brand: 'Glucophage',
      genericName: 'Metformin HCI',
      strength: '500mg',
      form: 'Tablet',
      price: 12.50,
      rxRequired: true,
      inStock: true,
      category: 'Diabetes',
      rating: 4.6,
      reviews: 78,
      fastDelivery: true
    },
    {
      id: '5',
      name: 'Omeprazole',
      brand: 'Losec',
      genericName: 'Omeprazole',
      strength: '20mg',
      form: 'Capsule',
      price: 15.75,
      rxRequired: true,
      inStock: true,
      category: 'Gastro',
      rating: 4.4,
      reviews: 112,
      fastDelivery: false
    },
    {
      id: '6',
      name: 'Vitamin D3',
      brand: 'D-Rise',
      genericName: 'Cholecalciferol',
      strength: '1000IU',
      form: 'Tablet',
      price: 6.80,
      rxRequired: false,
      inStock: true,
      category: 'Vitamins',
      rating: 4.2,
      reviews: 203,
      isPopular: true
    }
  ]

  const categories = ['All', 'Pain Relief', 'Antibiotics', 'Cold & Allergy', 'Diabetes', 'Gastro', 'Vitamins', 'Cardiac', 'Skin']

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.genericName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, { productId: product.id, quantity: 1, product }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prev => prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Header */}
      <div className="bg-gradient-to-br from-green-600 via-teal-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <Pill className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">MediMitra Pharmacy</h1>
                    <p className="text-xl text-green-100 mt-2">Your trusted online pharmacy with fast delivery</p>
                  </div>
                </div>
                
                {/* Service Features */}
                <div className="flex items-center space-x-8 mt-6">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-green-200" />
                    <span className="text-green-100 font-medium">Free delivery over $50</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-teal-200" />
                    <span className="text-teal-100">Licensed pharmacy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-200" />
                    <span className="text-blue-100">24/7 support</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{products.length}</div>
                      <div className="text-green-200 text-sm">Products</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{getTotalItems()}</div>
                      <div className="text-green-200 text-sm">In Cart</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-lg border-2 border-gray-100 w-fit mx-auto">
          {[
            { id: 'browse', label: 'Browse Products', icon: Search, color: 'green' },
            { id: 'cart', label: `Cart (${getTotalItems()})`, icon: ShoppingCart, color: 'blue' },
            { id: 'prescription', label: 'Upload Prescription', icon: Upload, color: 'purple' },
            { id: 'orders', label: 'My Orders', icon: Package, color: 'orange' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar - Moved to Left */}
          <div className="lg:col-span-1 space-y-6">
            {/* Cart Summary */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Cart Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{getTotalItems()}</div>
                      <div className="text-sm text-gray-600">Items in cart</div>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">${getTotalPrice().toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total amount</div>
                    </div>
                    <CreditCard className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Services */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl">
              <div className="text-center">
                <div className="p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm w-fit mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Prescription</h3>
                <p className="text-blue-100 mb-6">Get medicines delivered with your prescription</p>
                <button 
                  onClick={() => setActiveTab('prescription')}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white border-opacity-20"
                >
                  Upload Now
                </button>
              </div>
            </div>

            {/* Service Features */}
            <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-2 border-orange-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose Us?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Licensed pharmacy</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Fast delivery</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Quality assured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">24/7 support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Now has more space */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Browse Products Tab */}
              {activeTab === 'browse' && (
                <motion.div
                  key="browse"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Search and Filters */}
                  <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Search className="w-6 h-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Find Your Medicine</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search by medicine name, brand, or generic name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder:text-gray-500 text-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="relative">
                          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 text-lg appearance-none bg-white"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="space-y-8">
                    {/* Popular Products */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                          <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Popular Products</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.filter(p => p.isPopular).map(product => (
                          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                        ))}
                      </div>
                    </div>

                    {/* All Products */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">All Products</h3>
                        </div>
                        <div className="text-gray-600">{filteredProducts.length} products found</div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cart Tab */}
              {activeTab === 'cart' && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <ShoppingCart className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                          <ShoppingCart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-6">Add some products to get started</p>
                        <button 
                          onClick={() => setActiveTab('browse')}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                        >
                          Browse Products
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.productId} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                                  <Pill className="w-8 h-8 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                                  <p className="text-gray-600">{item.product.brand} • {item.product.strength}</p>
                                  <p className="text-green-600 font-semibold">${item.product.price}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => removeFromCart(item.productId)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <AlertCircle className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-semibold">Total: ${getTotalPrice().toFixed(2)}</span>
                            <span className="text-green-100">{getTotalItems()} items</span>
                          </div>
                          <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white border-opacity-20">
                            <CreditCard className="w-5 h-5 inline mr-2" />
                            Proceed to Checkout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  )
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-green-300 transition-all hover:shadow-xl h-full flex flex-col"
    >
      {/* Header Section */}
      <div className="flex flex-col space-y-3 mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center group-hover:from-green-200 group-hover:to-blue-200 transition-colors flex-shrink-0">
            <Pill className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{product.name}</h4>
            <p className="text-sm text-gray-600 mb-1">{product.brand} • {product.strength}</p>
            <p className="text-xs text-gray-500 mb-2">{product.genericName} • {product.form}</p>
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {product.isPopular && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Popular</span>
          )}
          {product.fastDelivery && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Fast</span>
          )}
          {product.rxRequired && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rx Required</span>
          )}
        </div>
      </div>

      {/* Rating Section */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({product.reviews})</span>
      </div>

      {/* Price and Stock Section */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xl font-bold text-green-600">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {product.discount && (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">{product.discount}% off</span>
          )}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>
        </div>
      </div>

      {/* Add to Cart Button - Push to bottom */}
      <div className="mt-auto">
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </motion.div>
  )
}
