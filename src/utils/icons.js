import React from 'react';
import { 
  ShoppingBag, Coffee, Car, Home as HomeIcon, Smartphone,
  Zap, HeartPulse, ShoppingCart, CreditCard
} from 'lucide-react';

export const getIconForCategory = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('ช้อป') || n.includes('shopee') || n.includes('lazada')) return <ShoppingBag className="text-orange-500" />;
  if (n.includes('อาหาร') || n.includes('กิน') || n.includes('กาแฟ')) return <Coffee className="text-amber-500" />;
  if (n.includes('รถ') || n.includes('เดินทาง') || n.includes('น้ำมัน')) return <Car className="text-emerald-500" />;
  if (n.includes('บ้าน') || n.includes('เช่า')) return <HomeIcon className="text-blue-500" />;
  if (n.includes('เน็ต') || n.includes('โทรศัพท์')) return <Smartphone className="text-indigo-500" />;
  if (n.includes('ไฟ') || n.includes('น้ำ')) return <Zap className="text-yellow-500" />;
  if (n.includes('ยา') || n.includes('สุขภาพ')) return <HeartPulse className="text-rose-500" />;
  if (n.includes('ของใช้')) return <ShoppingCart className="text-teal-500" />;
  return <CreditCard className="text-slate-400" />;
};
