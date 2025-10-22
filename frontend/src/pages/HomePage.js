import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Package, ShoppingBag, MessageCircle, Download, Search, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedProductView, setSelectedProductView] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchSettings();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleWhatsAppClick = (product) => {
    if (!settings?.whatsapp_number) {
      toast.error('WhatsApp number not configured');
      return;
    }
    const message = `Hi, I'm interested in ${product.name} (₹${product.price})`;
    const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGeneratePDF = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      const response = await axios.post(`${API}/generate-pdf`, {
        product_ids: selectedProducts
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'catalogue.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
      setPdfDialogOpen(false);
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {settings?.company_logo && (
                <img src={settings.company_logo} alt="Logo" className="h-12 w-auto object-contain" />
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Product Catalogue
                </h1>
                <p className="text-sm text-slate-600">Browse our complete product range</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="generate-pdf-btn" variant="outline" className="border-slate-300 hover:bg-slate-100">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Select Products for PDF Brochure</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {products.map(product => (
                        <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                          <Checkbox
                            data-testid={`pdf-select-${product.id}`}
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-slate-600">₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-slate-600">{selectedProducts.length} products selected</p>
                    <Button data-testid="download-pdf-btn" onClick={handleGeneratePDF} disabled={selectedProducts.length === 0}>
                      <Download className="mr-2 h-4 w-4" />
                      Generate PDF
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button data-testid="admin-login-btn" variant="ghost" onClick={() => navigate('/admin')} className="hover:bg-slate-100">
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              data-testid="search-input"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-300 focus:border-slate-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger data-testid="category-all" value="all" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              All Products
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger
                data-testid={`category-${category.id}`}
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="product-card overflow-hidden bg-white border-slate-200 hover:border-slate-300" data-testid={`product-card-${product.id}`}>
                <div className="relative h-56 bg-slate-100 overflow-hidden group">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-20 w-20 text-slate-300" />
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-white/90 text-slate-800 hover:bg-white">
                    {getCategoryName(product.category_id)}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">{product.name}</CardTitle>
                  <CardDescription className="text-slate-600">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">₹{product.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`whatsapp-btn-${product.id}`}
                        onClick={() => handleWhatsAppClick(product)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button data-testid={`view-details-btn-${product.id}`} variant="outline" className="flex-1 border-slate-300 hover:bg-slate-100">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Image Gallery */}
                            {product.images && product.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2">
                                {product.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`${product.name} ${idx + 1}`}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                ))}
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Category</p>
                              <Badge>{getCategoryName(product.category_id)}</Badge>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Price</p>
                              <p className="text-3xl font-bold text-slate-900">₹{product.price}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Description</p>
                              <p className="text-slate-700">{product.description}</p>
                            </div>
                            {product.youtube_link && (
                              <div>
                                <p className="text-sm text-slate-600 mb-2">Video</p>
                                <div className="aspect-video">
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    src={product.youtube_link.replace('watch?v=', 'embed/')}
                                    title="Product video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg"
                                  ></iframe>
                                </div>
                              </div>
                            )}
                            <Button
                              data-testid={`whatsapp-modal-btn-${product.id}`}
                              onClick={() => handleWhatsAppClick(product)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contact via WhatsApp
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;