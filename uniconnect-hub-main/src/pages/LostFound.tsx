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
import { lostFoundService, LostFoundItem } from '@/services/firestore';
import {
  Plus,
  Search,
  Clock,
  User,
  MapPin,
  Mail,
  CheckCircle,
  Filter,
  AlertCircle,
  Eye,
  Loader,
} from 'lucide-react';

export default function LostFound() {
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Create item state
  const [itemName, setItemName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'lost' | 'found'>('lost');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const list = await lostFoundService.getAll();
      setItems(list);
    } catch (e) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = (filter === 'all' ? items : items.filter(i => i.itemType === filter)).filter(i =>
    !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!itemName.trim() || !location.trim() || !description.trim() || !contactEmail.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await lostFoundService.create({
        title: itemName.trim(),
        description: description.trim(),
        itemType: status === 'lost' ? 'lost' : 'found',
        category: '',
        location: location.trim(),
        reporterId: user.uid,
        reporterName: user.name || 'Reporter',
        reporterEmail: contactEmail.trim(),
        reporterPhone: '',
        images: [],
        resolved: false,
        createdAt: new Date(),
      });

      toast.success('Report submitted');
      setIsCreateOpen(false);
      setItemName('');
      setLocation('');
      setDescription('');
      setStatus('lost');
      setContactEmail('');
      loadItems();
    } catch (e) {
      toast.error('Failed to submit report');
    }
  };

  const handleMarkAsFound = async (id?: string) => {
    if (!id) return;
    try {
      await lostFoundService.update(id, { resolved: true });
      toast.success('Marked as resolved');
      loadItems();
    } catch (e) {
      toast.error('Failed to update item');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lost & Found</h1>
            <p className="text-muted-foreground">Report lost or found items and help others.</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Report Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report Lost or Found Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('lost')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      status === 'lost' ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border'
                    }`}
                  >
                    <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Lost</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('found')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      status === 'found' ? 'border-success bg-success/10 text-success' : 'border-border'
                    }`}
                  >
                    <Eye className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">Found</span>
                  </button>
                </div>

                <div>
                  <Label>Item Name</Label>
                  <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Wallet" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Library" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Submit Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="found">Found</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center"><Loader className="w-6 h-6 animate-spin" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">No reports found</div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((it) => (
              <div key={it.id} className={`border rounded-lg p-4 ${it.resolved ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{it.title}</h3>
                    <p className="text-sm text-muted-foreground">{it.description}</p>
                    <div className="text-xs text-muted-foreground mt-2">{it.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{it.reporterName}</div>
                    <div className="text-xs text-muted-foreground">{new Date(it.createdAt?.toDate ? it.createdAt.toDate() : it.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {user?.uid === it.reporterId && !it.resolved && (
                    <Button onClick={() => handleMarkAsFound(it.id)} className="flex-1">Mark Resolved</Button>
                  )}
                  {user?.uid !== it.reporterId && (
                    <Button onClick={() => { navigator.clipboard.writeText(it.reporterEmail || ''); toast.success('Email copied'); }} variant="outline">Contact</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
