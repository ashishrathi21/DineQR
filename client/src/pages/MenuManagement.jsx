import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, UtensilsCrossed, Search, Tag, FolderPlus } from 'lucide-react';
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

  // Filter & Search states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "", image: "", categoryId: "" });
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const fetchMenuData = async () => {
    if (!restaurantId) return;
    try {
      const catRes = await axios.get(`${API_URL}/categories?restaurantId=${restaurantId}`);
      const itemRes = await axios.get(`${API_URL}/items?restaurantId=${restaurantId}`);
      setCategories(catRes.data.categories || []);
      setMenuItems(itemRes.data.menuItems || []);

      if (catRes.data.categories?.length > 0 && !newItem.categoryId) {
        setNewItem(prev => ({ ...prev, categoryId: catRes.data.categories[0]._id }));
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
    if (!newItem.categoryId) {
      toast.error("Please select a category first");
      return;
    }
    setIsSubmittingItem(true);
    try {
      await axios.post(`${API_URL}/items`, newItem);
      toast.success(`"${newItem.name}" added to menu!`);
      setNewItem({
        name: "",
        price: "",
        description: "",
        image: "",
        categoryId: categories[0]?._id || ""
      });
      fetchMenuData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add menu item.");
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      toast.success("Category deleted");
      if (selectedCategoryFilter === id) {
        setSelectedCategoryFilter('ALL');
      }
      fetchMenuData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category.");
    }
  };

  const handleDeleteItem = async (id, name) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
      toast.success(`"${name}" removed`);
      fetchMenuData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete menu item.");
    }
  };

  const getItemCountForCat = (catId) => {
    return menuItems.filter(item => {
      const itemCat = item.categoryId?._id || item.categoryId;
      return itemCat === catId;
    }).length;
  };

  const filteredMenuItems = menuItems.filter(item => {
    const itemCatId = item.categoryId?._id || item.categoryId;
    const matchesCat = selectedCategoryFilter === 'ALL' || itemCatId === selectedCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200 pb-12 font-sans max-w-full overflow-hidden">
      <Toaster position="top-right" />

      {/* Mobile Responsive Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tigh">Menu Management</h1>

          </div>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Organize item categories and digital menu offerings for your restaurant.
          </p>
        </div>
      </div>

      {/* Top 2-Column Section: Responsive Stack on Mobile, Equal Height on Desktop (`lg:items-stretch`) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:items-stretch">

        {/* Categories Card (Left 4 cols - Mobile Stack, Desktop Matching Height) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-auto lg:h-full space-y-4">
          <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Categories</h2>
                <p className="text-[11px] text-slate-500 font-medium">Manage item groups</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {categories.length}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category..."
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-xs font-semibold flex items-center justify-center shrink-0 shadow-xs"
              >
                <Plus size={15} />
              </button>
            </form>

            {/* Scrollable Category List */}
            <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto space-y-1.5 pr-1 pt-1 scrollbar-thin">
              {categories.map(cat => {
                const count = getItemCountForCat(cat._id);
                const isSelected = selectedCategoryFilter === cat._id;
                return (
                  <div
                    key={cat._id}
                    onClick={() => setSelectedCategoryFilter(cat._id === selectedCategoryFilter ? 'ALL' : cat._id)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer border ${isSelected
                      ? 'bg-orange-50/80 border-orange-200 text-orange-900 font-semibold'
                      : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200/60 text-slate-700 font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <Tag size={13} className={`shrink-0 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${isSelected ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {count}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat._id, cat.name);
                        }}
                        className="text-slate-300 hover:text-red-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        title="Delete category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-400 font-medium">No categories added</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Menu Item Form (Right 8 cols - Mobile Full, Desktop Matching Height) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-auto lg:h-full space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Add Menu Item</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Create a new dish or beverage entry for the QR menu</p>
          </div>

          <form onSubmit={handleAddItem} className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Item Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Paneer Butter Masala"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">₹</span>
                    <input
                      required
                      type="number"
                      placeholder="250"
                      value={newItem.price}
                      onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    required
                    value={newItem.categoryId}
                    onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 transition-all"
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newItem.image}
                    onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description of ingredients or preparation"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={categories.length === 0 || isSubmittingItem}
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                <span>{isSubmittingItem ? 'Adding Dish...' : 'Add Menu Item'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Bottom Section: Active Menu Items Grid (Mobile Responsive) */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Active Menu Items ({filteredMenuItems.length})</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Dishes currently visible to customers on table QR scan</p>
          </div>

          {/* Responsive Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Touch-Scrollable Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${selectedCategoryFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/60'
              }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map(cat => {
            const count = getItemCountForCat(cat._id);
            const isActive = selectedCategoryFilter === cat._id;
            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategoryFilter(cat._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${isActive
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/60'
                  }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Responsive Dishes Grid: 1 col on mobile, 2 on tablet, 3-4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-1">
          {filteredMenuItems.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all p-3 shadow-xs flex flex-col justify-between group min-w-0"
            >
              <div>
                <div className="h-32 sm:h-36 w-full bg-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center mb-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center text-slate-400 bg-slate-100"
                    style={{ display: item.image ? 'none' : 'flex' }}
                  >
                    <UtensilsCrossed size={22} className="opacity-40" />
                  </div>

                  {/* Floating Price Tag */}
                  <div className="absolute top-2 right-2 bg-slate-900/90 text-white px-2.5 py-0.5 rounded-md text-xs font-bold shadow-xs">
                    ₹{item.price}
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900 text-xs truncate w-full" title={item.name}>
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-[11px] font-semibold text-orange-600 truncate">
                    {item.categoryId?.name || 'Uncategorized'}
                  </p>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400">
                  Visible on QR
                </span>
                <button
                  onClick={() => handleDeleteItem(item._id, item.name)}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 flex items-center gap-1 text-xs font-medium"
                  title="Remove dish"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}

          {filteredMenuItems.length === 0 && (
            <div className="col-span-full py-10 text-center border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">No menu items found</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MenuManagement;
