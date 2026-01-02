import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Users, 
  CalendarDays, 
  ShoppingBag, 
  Search, 
  HelpCircle, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Rocket,
  Star
} from 'lucide-react';
import Header from '@/components/Header';

const features = [
  {
    icon: CalendarDays,
    title: 'Campus Events',
    description: 'Post and discover hackathons, freshers parties, flash mobs, and more.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Briefcase,
    title: 'Career Opportunities',
    description: 'Faculty posts placements, internships, and celebrates semester toppers.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    description: 'Buy and sell second-hand books, calculators, drafters & more.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Search,
    title: 'Lost & Found',
    description: 'Report lost items and help others find their belongings.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: HelpCircle,
    title: 'Help Requests',
    description: 'Ask for help or assist fellow students with their needs.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Alerts',
    description: 'Send urgent alerts to nearby users in case of emergencies.',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
];

const stats = [
  { value: '10K+', label: 'Active Students', icon: Users },
  { value: '500+', label: 'Campus Events', icon: CalendarDays },
  { value: '1000+', label: 'Items Listed', icon: ShoppingBag },
  { value: '50+', label: 'Colleges', icon: Zap },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-semibold mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              🚀 Your Campus, Connected
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6">
              The Ultimate{' '}
              <span className="gradient-text">Campus Platform</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover events, find opportunities, trade items, and connect with your campus community — all in one powerful platform designed for students and faculty.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 text-white border-0 h-12 px-8 text-base" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  I'm a Student
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  I'm Faculty
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border/50 p-4 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              UniConnect brings your entire college experience together with powerful features designed for modern students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="group rounded-2xl border border-border/50 p-6 bg-card/50 backdrop-blur hover:border-primary/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Loved by Students & Faculty
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a thriving community of thousands who are already using UniConnect
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border/50 p-6 bg-card/50 backdrop-blur">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"UniConnect made it so easy to find events and connect with people in my college. Highly recommend!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Student User</p>
                    <p className="text-muted-foreground">Campus Member</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10" />
            
            <div className="text-center">
              <Rocket className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students and faculty members creating an amazing campus experience.
              </p>
              
              <Button size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 text-white border-0 h-12 px-8 mb-6" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  Join UniConnect Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  100% Free
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No Credit Card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  College Email Only
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6 bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold gradient-text">UniConnect</span>
              </div>
              <p className="text-sm text-muted-foreground">Campus Hub for Students & Faculty</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 pt-8">
            <p className="text-sm text-muted-foreground text-center">
              © 2024 UniConnect. Made for students, by students. 🎓
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
