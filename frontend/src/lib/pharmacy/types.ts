export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  genericName: string
  strength: string
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Cream' | 'Drop' | 'Gel' | 'Others'
  priceBDT: number
  rxRequired: boolean
  inStock: boolean
  imageUrl?: string
  category:
    | 'Cold & Allergy'
    | 'Pain Relief'
    | 'Antibiotics'
    | 'Gastro'
    | 'Diabetes'
    | 'Cardiac'
    | 'Vitamins'
    | 'Skin'
    | 'Others'
}

export type CartItem = { productId: string; quantity: number }

export type Order = {
  id: string
  createdAt: string
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
  subtotal: number
  deliveryFee: number
  total: number
  address: {
    fullName: string
    phone: string
    addressLine: string
    district: string
    notes?: string
  }
  paymentMethod: 'COD'
  status: 'Processing' | 'Dispatched' | 'Delivered' | 'Cancelled'
  prescriptions?: Array<{ productId: string; fileName: string; dataUrl: string }>
}



