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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Menu Management</h1>
        <p className="text-slate-500 font-medium mt-2">Add or edit your digital menu offerings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Categories Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Categories</h2>
          
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Starters" 
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium"
            />
            <button type="submit" className="w-12 flex items-center justify-center bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
              <Plus size={20} />
            </button>
          </form>

          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-colors">
                <span className="font-bold text-slate-700">{cat.name}</span>
                <button onClick={() => handleDeleteCategory(cat._id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
            {categories.length === 0 && <p className="text-sm font-medium text-slate-400 text-center py-4">No categories added</p>}
          </ul>
        </div>

        {/* Menu Items Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Add Item Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Add Menu Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium" />
                <input required type="number" placeholder="Price (₹)" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select required value={newItem.categoryId} onChange={e => setNewItem({...newItem, categoryId: e.target.value})} className="px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium">
                   {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <input type="text" placeholder="Image URL (Optional)" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium" />
              </div>
              <input type="text" placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium" />
              
              <button disabled={categories.length === 0} type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={18} /> Add to Menu
              </button>
            </form>
          </div>

          {/* List Items */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Active Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map(item => (
                <div key={item._id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl hover:border-orange-200 transition-colors group">
                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                       {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><UtensilsCrossed size={24}/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-slate-900 truncate">{item.name}</h3>
                           <button onClick={()=>handleDeleteItem(item._id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                               <Trash2 size={16} />
                           </button>
                        </div>
                        <p className="text-xs font-bold text-orange-500 my-1">{item.categoryId?.name}</p>
                        <p className="text-slate-500 text-xs truncate mb-2">{item.description}</p>
                        <p className="font-black text-slate-900">₹{item.price}</p>
                    </div>
                </div>
              ))}
              {menuItems.length === 0 && <p className="text-sm font-medium text-slate-400 col-span-full py-4 text-center">No menu items added yet.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
