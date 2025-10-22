import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LogOut, Plus, Edit, Trash2, Package, Folder, Settings as SettingsIcon, X } from 'lucide-react';

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  // Category Form
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    images: [],
    youtube_link: '',
    status: 'draft'
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'draft', 'published'

  // Settings Form
  const [settingsForm, setSettingsForm] = useState({ whatsapp_number: '', company_logo: '' });

  useEffect(() => {
    verifyToken();
    fetchCategories();
    fetchProducts();
    fetchSettings();
  }, []);

  const verifyToken = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }

    try {
      await axios.get(`${API}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      localStorage.removeItem('admin_token');
      navigate('/admin');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return { Authorization: `Bearer ${token}` };
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(
          `${API}/categories/${editingCategory.id}`,
          categoryForm,
          { headers: getAuthHeaders() }
        );
        toast.success('Category updated successfully');
      } else {
        await axios.post(
          `${API}/categories`,
          categoryForm,
          { headers: getAuthHeaders() }
        );
        toast.success('Category created successfully');
      }
      setCategoryDialogOpen(false);
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error('Error saving category');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`${API}/categories/${id}`, { headers: getAuthHeaders() });
      toast.success('Category deleted successfully');
      fetchCategories();
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  const openCategoryDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setCategoryDialogOpen(true);
  };

  // Products
  const fetchProducts = async () => {
    try {
      const url = statusFilter === 'all'
        ? `${API}/products`
        : `${API}/products?status=${statusFilter}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Re-fetch products when status filter changes
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [statusFilter, activeTab]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `${API}/upload-image`,
          formData,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          setProductForm(prev => ({
            ...prev,
            images: [...prev.images, response.data.url]
          }));
          toast.success(`Image uploaded: ${file.name}`);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const removeImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...productForm,
        price: parseFloat(productForm.price)
      };

      if (editingProduct) {
        await axios.put(
          `${API}/products/${editingProduct.id}`,
          submitData,
          { headers: getAuthHeaders() }
        );
        toast.success('Product updated successfully');
      } else {
        await axios.post(
          `${API}/products`,
          submitData,
          { headers: getAuthHeaders() }
        );
        toast.success('Product created successfully');
      }
      setProductDialogOpen(false);
      setProductForm({ name: '', description: '', price: '', category_id: '', images: [], youtube_link: '' });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`${API}/products/${id}`, { headers: getAuthHeaders() });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const openProductDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category_id: product.category_id,
        images: product.images || [],
        youtube_link: product.youtube_link || '',
        status: product.status || 'draft'
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', category_id: '', images: [], youtube_link: '', status: 'draft' });
    }
    setProductDialogOpen(true);
  };

  // Quick toggle product status
  const toggleProductStatus = async (product) => {
    try {
      const newStatus = product.status === 'published' ? 'draft' : 'published';
      await axios.put(
        `${API}/products/${product.id}`,
        { ...product, status: newStatus },
        { headers: getAuthHeaders() }
      );
      toast.success(`Product ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Error updating product status');
    }
  };

  // Settings
  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      setSettingsForm({
        whatsapp_number: response.data.whatsapp_number || '',
        company_logo: response.data.company_logo || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
          `${API}/upload-image`,
          formData,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          setSettingsForm(prev => ({ ...prev, company_logo: response.data.url }));
          toast.success('Logo uploaded successfully');
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast.error('Failed to upload logo');
      }
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API}/settings`,
        settingsForm,
        { headers: getAuthHeaders() }
      );
      toast.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error('Error updating settings');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const formatDescription = (text) => {
    if (!text) return '';

    const lines = text.split('\n');
    let formattedHtml = '';
    let inList = false;

    lines.forEach((line) => {
      if (line.trim() === '') {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        formattedHtml += '<br/>';
        return;
      }

      if (line.trim().match(/^[-*•]\s/)) {
        if (!inList) {
          formattedHtml += '<ul class="list-disc ml-5 space-y-1">';
          inList = true;
        }
        const content = line.trim().substring(2);
        formattedHtml += `<li>${formatInlineStyles(content)}</li>`;
      } else {
        if (inList) {
          formattedHtml += '</ul>';
          inList = false;
        }
        formattedHtml += `<p class="mb-1">${formatInlineStyles(line)}</p>`;
      }
    });

    if (inList) {
      formattedHtml += '</ul>';
    }

    return formattedHtml;
  };

  const formatInlineStyles = (text) => {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em>$1</em>');
    return text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Manage your catalogue</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button data-testid="view-site-btn" variant="outline" onClick={() => navigate('/')} className="border-slate-300 hover:bg-slate-100">
                View Site
              </Button>
              <Button data-testid="logout-btn" variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 mb-8">
            <TabsTrigger data-testid="tab-products" value="products" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger data-testid="tab-categories" value="categories" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Folder className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger data-testid="tab-settings" value="settings" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Products</h2>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Published Only
                      </div>
                    </SelectItem>
                    <SelectItem value="draft">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        Drafts Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="add-product-btn" onClick={() => openProductDialog()} className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>Fill in the product details below</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        data-testid="product-name-input"
                        id="product-name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        data-testid="product-description-input"
                        id="product-description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        required
                        rows={6}
                      />
                      <div className="mt-2 text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-slate-700 mb-1">Formatting Guide:</p>
                        <ul className="space-y-1">
                          <li>• Use <code className="bg-slate-200 px-1 rounded">**text**</code> for <strong>bold text</strong></li>
                          <li>• Use <code className="bg-slate-200 px-1 rounded">*text*</code> for <em>italic text</em></li>
                          <li>• Start lines with <code className="bg-slate-200 px-1 rounded">-</code> for bullet points</li>
                          <li>• Press Enter for new lines</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="product-price">Price (₹)</Label>
                      <Input
                        data-testid="product-price-input"
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-category">Category</Label>
                      <Select
                        value={productForm.category_id}
                        onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}
                        required
                      >
                        <SelectTrigger data-testid="product-category-select">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="product-youtube">YouTube Link (optional)</Label>
                      <Input
                        data-testid="product-youtube-input"
                        id="product-youtube"
                        value={productForm.youtube_link}
                        onChange={(e) => setProductForm({ ...productForm, youtube_link: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="product-images">Product Images</Label>
                      <Input
                        data-testid="product-images-input"
                        id="product-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                      {productForm.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {productForm.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-contain rounded bg-slate-50 border border-slate-200" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Product Status</Label>
                      <Select
                        value={productForm.status}
                        onValueChange={(value) => setProductForm({ ...productForm, status: value })}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">
                            <div className="flex items-center">
                              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                              Draft - Save for later
                            </div>
                          </SelectItem>
                          <SelectItem value="published">
                            <div className="flex items-center">
                              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                              Published - Visible to customers
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 mt-1">
                        {productForm.status === 'draft'
                          ? 'This product will be saved as draft and not visible to customers'
                          : 'This product will be visible on the public catalogue'}
                      </p>
                    </div>
                    <DialogFooter>
                      <Button data-testid="product-submit-btn" type="submit" className="bg-slate-900 hover:bg-slate-800">
                        {editingProduct ? 'Update' : 'Create'} {productForm.status === 'draft' ? 'Draft' : 'Product'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="bg-white border-slate-200" data-testid={`product-item-${product.id}`}>
                  <div className="relative h-40 bg-slate-100">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {product.status === 'published' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm">{getCategoryName(product.category_id)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="text-slate-600 text-sm mb-3 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
                    />
                    <p className="text-xl font-bold text-slate-900 mb-4">₹{product.price}</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          data-testid={`edit-product-${product.id}`}
                          onClick={() => openProductDialog(product)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => toggleProductStatus(product)}
                          variant={product.status === 'published' ? 'secondary' : 'default'}
                          size="sm"
                          className="flex-1"
                        >
                          {product.status === 'published' ? 'Move to Draft' : 'Publish'}
                        </Button>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button data-testid={`delete-product-${product.id}`} variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this product? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="add-category-btn" onClick={() => openCategoryDialog()} className="bg-slate-900 hover:bg-slate-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>Manage product categories</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        data-testid="category-name-input"
                        id="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-description">Description (optional)</Label>
                      <Textarea
                        data-testid="category-description-input"
                        id="category-description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button data-testid="category-submit-btn" type="submit" className="bg-slate-900 hover:bg-slate-800">
                        {editingCategory ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <Card key={category.id} className="bg-white border-slate-200" data-testid={`category-item-${category.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Folder className="mr-2 h-5 w-5 text-slate-600" />
                      {category.name}
                    </CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`edit-category-${category.id}`}
                        onClick={() => openCategoryDialog(category)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button data-testid={`delete-category-${category.id}`} variant="destructive" size="sm" className="flex-1">
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure? This will also delete all products in this category.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="max-w-2xl mx-auto bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Configure your WhatsApp contact and company logo</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      data-testid="whatsapp-input"
                      id="whatsapp"
                      value={settingsForm.whatsapp_number}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                      placeholder="e.g., 919876543210 (with country code, no +)"
                    />
                    <p className="text-sm text-slate-500 mt-1">Enter with country code, without + symbol</p>
                  </div>
                  <div>
                    <Label htmlFor="logo">Company Logo</Label>
                    <Input
                      data-testid="logo-input"
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    {settingsForm.company_logo && (
                      <div className="mt-3">
                        <img src={settingsForm.company_logo} alt="Logo preview" className="h-20 object-contain" />
                      </div>
                    )}
                  </div>
                  <Button data-testid="settings-submit-btn" type="submit" className="bg-slate-900 hover:bg-slate-800">
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;