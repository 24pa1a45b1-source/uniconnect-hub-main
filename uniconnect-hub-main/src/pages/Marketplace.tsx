import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { marketplaceService, MarketplaceItem } from '@/services/firestore';
import { 
  Plus, 
  ShoppingBag, 
  Clock, 
  User,
  IndianRupee,
  Tag,
  CheckCircle,
  Filter,
  Search,
  Package,
  Loader,
  Trash2,
} from 'lucide-react';

const conditions: Array<'new' | 'like-new' | 'good' | 'fair' | 'poor'> = ['new', 'like-new', 'good', 'fair', 'poor'];

export default function Marketplace() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create item state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'like-new' | 'good' | 'fair' | 'poor'>('good');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const fetchedItems = await marketplaceService.getAll();
      setItems(fetchedItems);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!title.trim() || !description.trim() || !price || !category) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await marketplaceService.create({
        title,
        description,
        price: parseFloat(price),
        condition,
        category,
        sellerId: user.uid,
        sellerName: user.name || 'Seller',
        sellerEmail: user.email,
        images: [],
        isSold: false,
      });

      toast.success('Item listed successfully!');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setCondition('good');
      loadItems();
    } catch (error) {
      toast.error('Failed to create listing');
    }
  };

  const handleMarkAsSold = async (itemId: string) => {
    try {
      await marketplaceService.update(itemId, { isSold: true });
      toast.success('Item marked as sold!');
      loadItems();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await marketplaceService.delete(itemId);
      toast.success('Item deleted');
      loadItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = (filter === 'all' 
    ? items 
    : filter === 'available' 
    ? items.filter(i => !i.isSold)
    : items.filter(i => i.isSold)
  ).filter(item => 
    !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground">
              Buy and sell second-hand books, calculators, drafters & more
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Sell Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>List Item for Sale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Item Title</Label>
                  <Input
                    placeholder="e.g., Engineering Drawing Kit"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g., Books, Stationery, Electronics"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the item..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <Select value={condition} onValueChange={(v: any) => setCondition(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full">
                  List for Sale
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isOwner = item.sellerId === user?.uid;

              return (
                <div key={item.id} className={`border rounded-lg overflow-hidden card-hover transition ${
                  item.isSold ? 'opacity-60' : ''
                }`}>
                  {/* Placeholder Image */}
                  <div className="h-40 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground/50" />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            item.isSold 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {item.isSold ? 'Sold' : 'Available'}
                          </span>
                          <span className="text-xs bg-secondary px-2 py-1 rounded">
                            {item.condition}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 flex items-center">
                          <IndianRupee className="w-4 h-4" />
                          {item.price}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.sellerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : new Date(item.createdAt?.toDate?.()).toLocaleDateString()}
                      </span>
                    </div>

                    {isOwner && (
                      <div className="flex gap-2">
                        {!item.isSold && (
                          <Button
                            onClick={() => handleMarkAsSold(item.id!)}
                            size="sm"
                            className="flex-1"
                            variant="default"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Sold
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(item.id!)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {!isOwner && !item.isSold && (
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => toast.info(`Contact ${item.sellerName} to purchase`)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Contact Seller
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              List your items to start selling!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
