import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, UtensilsCrossed } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = rawApiUrl.endsWith("/menu") ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/menu`;
axios.defaults.withCredentials = true;

const MenuManagement = () => {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId?._id || user?.restaurantId;

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "", image: "", categoryId: "" });

  const fetchMenuData = async () => {
    if (!restaurantId) return;
    try {
      const catRes = await axios.get(`${API_URL}/categories?restaurantId=${restaurantId}`);
      const itemRes = await axios.get(`${API_URL}/items?restaurantId=${restaurantId}`);
      setCategories(catRes.data.categories);
      setMenuItems(itemRes.data.menuItems);
      
      if(catRes.data.categories.length > 0 && !newItem.categoryId) {
          setNewItem(prev => ({...prev, categoryId: catRes.data.categories[0]._id}));
      }
    } catch (error) {
      console.error("Failed to fetch menu data", error);
      toast.error("Failed to load menu data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchMenuData();
    }
  }, [restaurantId]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await axios.post(`${API_URL}/categories`, { name: newCatName });
      toast.success(`Category "${newCatName}" added!`);
      setNewCatName("");
      fetchMenuData();
    } catch (error) { 
      console.error(error); 
      toast.error("Failed to add category.");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/items`, newItem);
      toast.success(`Menu item "${newItem.name}" added!`);
      setNewItem({ name: "", price: "", description: "", image: "", categoryId: categories[0]?._id });
      fetchMenuData();
    } catch (error) { 
      console.error(error); 
      toast.error("Failed to add menu item.");
    }
  };

  const handleDeleteCategory = async (id) => {
      try {
          await axios.delete(`${API_URL}/categories/${id}`);
          toast.success("Category deleted");
          fetchMenuData();
      } catch (error) { 
          console.error(error); 
          toast.error("Failed to delete category.");
      }
  }

  const handleDeleteItem = async (id) => {
      try {
          await axios.delete(`${API_URL}/items/${id}`);
          toast.success("Menu item deleted");
          fetchMenuData();
      } catch (error) { 
          console.error(error); 
          toast.error("Failed to delete menu item.");
      }
  }

  if (isLoading) return <div className="h-full w-full flex items-center justify-center bg-transparent"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Menu Management</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Organize categories and digital menu offerings for your restaurant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Categories Section */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs h-fit space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Categories</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage item groups (e.g. Starters, Drinks)</p>
          </div>
          
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input 
              type="text" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category..." 
              className="flex-1 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900"
            />
            <button type="submit" className="px-3.5 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-semibold shrink-0">
              <Plus size={16} />
            </button>
          </form>

          <ul className="space-y-1.5 pt-1">
            {categories.map(cat => (
              <li key={cat._id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 group border border-transparent hover:border-slate-200/60 transition-colors">
                <span className="font-semibold text-xs text-slate-700">{cat.name}</span>
                <button onClick={() => handleDeleteCategory(cat._id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
            {categories.length === 0 && <p className="text-xs font-medium text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">No categories added</p>}
          </ul>
        </div>

        {/* Menu Items Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add Item Form */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Add Menu Item</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Create a new dish or beverage entry for the QR menu</p>
            </div>
            <form onSubmit={handleAddItem} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input required type="text" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900" />
                <input required type="number" placeholder="Price (₹)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select required value={newItem.categoryId} onChange={e => setNewItem({...newItem, categoryId: e.target.value})} className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900">
                   {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <input type="text" placeholder="Image URL (Optional)" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900" />
              </div>
              <input type="text" placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-xs font-medium text-slate-900" />
              
              <button disabled={categories.length === 0} type="submit" className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={16} /> Add Menu Item
              </button>
            </form>
          </div>

          {/* List Items */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Active Menu Items ({menuItems.length})</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Dishes currently visible to customers on table QR scan</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {menuItems.map(item => (
                <div key={item._id} className="flex gap-3 p-3 border border-slate-200/80 rounded-lg hover:border-slate-300 transition-colors group bg-white">
                    <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden shrink-0">
                       {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><UtensilsCrossed size={18}/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className="font-semibold text-slate-900 text-xs truncate">{item.name}</h3>
                           <button onClick={()=>handleDeleteItem(item._id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5">
                               <Trash2 size={14} />
                           </button>
                        </div>
                        <p className="text-[11px] font-semibold text-orange-600 my-0.5">{item.categoryId?.name}</p>
                        <p className="text-slate-500 text-[11px] truncate mb-1">{item.description}</p>
                        <p className="font-bold text-slate-900 text-xs">₹{item.price}</p>
                    </div>
                </div>
              ))}
              {menuItems.length === 0 && <p className="text-xs font-medium text-slate-400 col-span-full py-8 text-center border border-dashed border-slate-200 rounded-lg">No menu items added yet.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
