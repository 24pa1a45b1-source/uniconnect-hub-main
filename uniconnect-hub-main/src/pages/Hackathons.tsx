import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { hackathonsService, Hackathon } from '@/services/firestore';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Award,
  Users,
  CheckCircle,
  Clock,
  Loader,
} from 'lucide-react';

export default function Hackathons() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Create hackathon state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [theme, setTheme] = useState('');
  const [prizes, setPrizes] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const list = await hackathonsService.getAll();
      setHackathons(list);
    } catch (e) {
      toast.error('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const filteredHackathons = hackathons.filter(h =>
    !searchQuery || h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.theme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !startDate || !endDate || !location.trim() || !theme.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      console.log('Creating hackathon with user:', user.uid);
      await hackathonsService.create({
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location.trim(),
        theme: theme.trim(),
        prizes: prizes.trim(),
        organizerId: user.uid,
        organizerName: user.name || 'Organizer',
        organizerEmail: user.email || '',
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        status: 'upcoming',
      });

      toast.success('Hackathon created successfully!');
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setLocation('');
      setTheme('');
      setPrizes('');
      setMaxParticipants('');
      loadHackathons();
    } catch (e) {
      console.error('Create hackathon error:', e);
      toast.error('Failed to create hackathon: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleApply = async (hackathonId?: string) => {
    if (!hackathonId || !user) {
      toast.error('Unable to apply');
      return;
    }

    try {
      await hackathonsService.applyToHackathon(hackathonId, user.uid);
      toast.success('Applied to hackathon successfully!');
      loadHackathons();
    } catch (e) {
      toast.error('Failed to apply');
    }
  };

  const handleWithdraw = async (hackathonId?: string) => {
    if (!hackathonId || !user) {
      toast.error('Unable to withdraw');
      return;
    }

    try {
      await hackathonsService.removeApplicant(hackathonId, user.uid);
      toast.success('Withdrawn from hackathon');
      loadHackathons();
    } catch (e) {
      toast.error('Failed to withdraw');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hackathons</h1>
            <p className="text-muted-foreground">Discover and participate in hackathons</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Hackathon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Hackathon</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., AI Innovation Hackathon" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the hackathon..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Virtual / Campus Hall" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Theme</Label>
                    <Input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g., Web3, AI, IoT" />
                  </div>
                  <div>
                    <Label>Max Participants</Label>
                    <Input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <Label>Prizes</Label>
                  <Textarea value={prizes} onChange={(e) => setPrizes(e.target.value)} rows={2} placeholder="e.g., ₹50,000 for 1st place..." />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create Hackathon
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search hackathons..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="text-center py-16 border rounded-lg">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No hackathons found</h3>
            <p className="text-muted-foreground">Create one or check back later</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredHackathons.map((hackathon) => {
              const isOrganizer = hackathon.organizerId === user?.uid;
              const hasApplied = hackathon.applicants?.includes(user?.uid || '') || false;
              const startDateObj = hackathon.startDate instanceof Date ? hackathon.startDate : (hackathon.startDate as any)?.toDate?.() || new Date();
              const endDateObj = hackathon.endDate instanceof Date ? hackathon.endDate : (hackathon.endDate as any)?.toDate?.() || new Date();

              return (
                <div key={hackathon.id} className="border rounded-lg p-5 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{hackathon.title}</h3>
                      <p className="text-sm text-muted-foreground">{hackathon.description}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{startDateObj.toLocaleDateString()} - {endDateObj.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{hackathon.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="w-4 h-4" />
                        <span>{hackathon.theme}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{hackathon.applicants?.length || 0} applicants</span>
                      </div>
                    </div>

                    {hackathon.prizes && (
                      <div className="bg-accent/10 p-3 rounded text-sm">
                        <p className="font-medium text-accent">Prizes</p>
                        <p className="text-muted-foreground">{hackathon.prizes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {isOrganizer ? (
                        <Button disabled className="flex-1" variant="outline">
                          Your Hackathon
                        </Button>
                      ) : hasApplied ? (
                        <Button onClick={() => handleWithdraw(hackathon.id)} className="flex-1" variant="outline">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Applied
                        </Button>
                      ) : (
                        <Button onClick={() => handleApply(hackathon.id)} className="flex-1">
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
