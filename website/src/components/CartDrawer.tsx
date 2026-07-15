'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  const { showToast } = useToast();

  const handleUpdateQuantity = (itemId: string, name: string, newQty: number) => {
    if (newQty < 1) {
      removeFromCart(itemId);
      showToast('info', `Removed "${name}" from cart.`);
      return;
    }
    updateQuantity(itemId, newQty);
    showToast('success', `Updated quantity of "${name}" in cart.`);
  };

  const handleRemoveFromCart = (itemId: string, name: string) => {
    removeFromCart(itemId);
    showToast('info', `Removed "${name}" from cart.`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Slider Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl rounded-l-[2.5rem] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-display text-lg font-bold">Your Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-foreground hover:bg-muted hover:text-primary transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6">
                  <div className="rounded-full bg-muted p-6 mb-4 text-primary animate-pulse">
                    <ShoppingBag className="h-12 w-12" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-1 text-primary">Your Cart is Empty</h3>
                  <p className="text-sm text-muted-foreground mb-6">Explore our delectable range of customized treats to start ordering!</p>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-secondary transition-all"
                  >
                    Browse Bakes
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex gap-4 border-b border-border/30 pb-5"
                  >
                    {/* Product Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.5rem] bg-muted border border-border/50">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="font-display text-base font-bold leading-snug line-clamp-1">{item.product.name}</h4>
                        {/* Selected Variants */}
                        {(item.selectedVariants.size || item.selectedVariants.flavor) && (
                          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground font-medium">
                            {item.selectedVariants.size && (
                              <span className="rounded bg-muted px-1.5 py-0.5 border border-border/20">
                                Size: {item.selectedVariants.size}
                              </span>
                            )}
                            {item.selectedVariants.flavor && (
                              <span className="rounded bg-muted px-1.5 py-0.5 border border-border/20">
                                Flavor: {item.selectedVariants.flavor}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Lead Time Indicator */}
                        <p className="mt-1 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                          ⏱️ Needs {item.product.lead_time_hours} hrs lead time
                        </p>
                      </div>

                      {/* Quantity Selector & Price */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-border p-0.5 bg-[#fcfbf9]">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.product.name, item.quantity - 1)}
                            className="rounded-full p-1 text-foreground hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.product.name, item.quantity + 1)}
                            className="rounded-full p-1 text-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-primary">LKR {item.totalPrice.toLocaleString()}</span>
                          <button
                            onClick={() => handleRemoveFromCart(item.id, item.product.name)}
                            className="text-muted-foreground hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer summary and checkout CTA */}
            {cartItems.length > 0 && (
              <div className="border border-border/60 bg-muted/40 p-5 m-4 rounded-[2rem] space-y-4 shadow-sm">
                <div className="flex justify-between text-base font-bold">
                  <span>Subtotal</span>
                  <span className="text-primary">LKR {cartSubtotal.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  * Delivery fees are calculated on the next step based on your Colombo delivery zone.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-secondary transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full text-center text-xs font-semibold py-2 hover:text-primary transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
