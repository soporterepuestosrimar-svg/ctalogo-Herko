export interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
  brand: 'Ford' | 'Jeep' | 'Dodge/RAM' | 'Chevrolet' | 'Multimarca';
  category: 
    | 'Bombas de Gasolina'
    | 'Sensores'
    | 'Bobinas y Encendido'
    | 'Válvulas e Inyección'
    | 'Refrigeración y Lubricación'
    | 'Frenos y Suspensión'
    | 'Filtros y Químicos'
    | 'Otros';
  vehicleCompatibility?: string;
  imageUrl?: string;
  stockStatus?: 'Disponible' | 'Bajo Pedido' | 'Consultar';
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Advisor {
  id: string;
  name: string;
  phone: string; // E.g. "+57 316 0181283"
  rawPhone: string; // E.g. "573160181283"
  role: string;
  avatarColor: string;
}

export interface CustomerOrderInfo {
  customerName: string;
  city: string;
  phone: string;
  vehicleModel: string;
  advisorId: string;
  notes: string;
}
