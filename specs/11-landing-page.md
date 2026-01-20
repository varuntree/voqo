# Landing Page Specification

## Overview
Marketing landing page inspired by Square's design. Clean, professional, focused on converting visitors to try the product.

---

## Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         Navbar                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      Hero Section                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Features Section                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   How It Works Section                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                   Testimonials Section                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     Pricing Section                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                       CTA Section                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                         Footer                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Navigation Bar

### Desktop
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]     Features  Pricing  Docs     [Get Started →]     │
└─────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]                                           [☰]       │
└─────────────────────────────────────────────────────────────┘
```

### Component

```tsx
function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold">Voqo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

---

## Hero Section

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Never miss another call                        │
│                                                             │
│   AI voice agents that answer calls, qualify leads,         │
│   and book appointments - 24/7                              │
│                                                             │
│              [Get Started Free]  [Watch Demo]               │
│                                                             │
│            ┌─────────────────────────────────┐              │
│            │                                 │              │
│            │     [Product Screenshot]        │              │
│            │                                 │              │
│            └─────────────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Content

**Headline:** "Never miss another call"

**Subheadline:** "AI voice agents that answer calls, qualify leads, and book appointments - 24/7. Built for real estate professionals."

**CTA Primary:** "Get Started Free"
**CTA Secondary:** "Watch Demo"

### Component

```tsx
function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.1),transparent)]" />

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Never miss another call
          </h1>

          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            AI voice agents that answer calls, qualify leads, and book appointments - 24/7. Built for real estate professionals.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Product screenshot */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
            <Image
              src="/images/dashboard-preview.png"
              alt="Voqo Dashboard"
              width={1200}
              height={675}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Features Section

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                    Everything you need                       │
│         to automate your phone communications               │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 🤖         │  │ 📞         │  │ 💬         │          │
│  │ AI Agents  │  │ Inbound &  │  │ Smart SMS  │          │
│  │            │  │ Outbound   │  │ Follow-ups │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ 📊         │  │ 🔗         │  │ 📱         │          │
│  │ Call Logs  │  │ API        │  │ Batch      │          │
│  │ & Insights │  │ Functions  │  │ Campaigns  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Feature List

1. **AI Voice Agents**
   - Natural conversations with callers
   - Multiple agents for different purposes
   - Customizable personalities and prompts

2. **Inbound & Outbound Calls**
   - Answer every incoming call
   - Make outbound calls to contacts
   - Full call recordings and transcripts

3. **Smart SMS Follow-ups**
   - Automatic post-call SMS
   - Customizable templates
   - Caller summaries delivered instantly

4. **Call Logs & Insights**
   - Complete call history
   - AI-generated summaries
   - Searchable transcripts

5. **Custom API Functions**
   - Connect to your CRM
   - Real-time property lookups
   - Calendar integrations

6. **Batch Campaigns**
   - Upload contact lists
   - Automated outbound campaigns
   - Detailed reporting

### Component

```tsx
const features = [
  {
    icon: Bot,
    title: "AI Voice Agents",
    description: "Natural conversations powered by advanced AI. Customize your agent's personality and responses."
  },
  {
    icon: Phone,
    title: "Inbound & Outbound",
    description: "Handle incoming calls 24/7 and make outbound calls to leads automatically."
  },
  {
    icon: MessageSquare,
    title: "Smart SMS Follow-ups",
    description: "Send automatic follow-up messages with call summaries to every caller."
  },
  {
    icon: BarChart3,
    title: "Call Logs & Insights",
    description: "Full call history with AI summaries, transcripts, and recordings."
  },
  {
    icon: Plug,
    title: "Custom Functions",
    description: "Connect to any API. Look up properties, check calendars, update your CRM."
  },
  {
    icon: Users,
    title: "Batch Campaigns",
    description: "Upload contact lists and run automated outbound call campaigns."
  }
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            to automate your phone communications
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## How It Works Section

### Steps

1. **Configure Your Agent**
   - Set up your AI agent with custom prompts
   - Choose from templates or create your own

2. **Connect Your Number**
   - Link your existing phone number
   - Calls are automatically routed to your agent

3. **Start Receiving Calls**
   - Your agent handles calls 24/7
   - Get instant notifications and summaries

### Component

```tsx
const steps = [
  {
    number: "01",
    title: "Configure Your Agent",
    description: "Set up your AI agent with custom prompts and personality. Choose from templates or create your own.",
    image: "/images/step-1-configure.png"
  },
  {
    number: "02",
    title: "Connect Your Number",
    description: "Link your existing phone number. Calls are automatically routed to your AI agent.",
    image: "/images/step-2-connect.png"
  },
  {
    number: "03",
    title: "Start Receiving Calls",
    description: "Your agent handles calls 24/7. Get instant notifications, summaries, and transcripts.",
    image: "/images/step-3-calls.png"
  }
];

function HowItWorksSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes, not hours
          </p>
        </div>

        <div className="mt-16 space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={cn(
                "flex flex-col md:flex-row items-center gap-12",
                index % 2 === 1 && "md:flex-row-reverse"
              )}
            >
              <div className="flex-1">
                <span className="text-5xl font-bold text-muted-foreground/30">
                  {step.number}
                </span>
                <h3 className="mt-4 text-2xl font-bold">{step.title}</h3>
                <p className="mt-4 text-lg text-muted-foreground">
                  {step.description}
                </p>
              </div>
              <div className="flex-1">
                <div className="rounded-xl border bg-background shadow-lg overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={600}
                    height={400}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Testimonials Section

### Content (Placeholder)

```tsx
const testimonials = [
  {
    quote: "Voqo has transformed how we handle leads. We never miss a call anymore, and our response time went from hours to seconds.",
    author: "Sarah Johnson",
    title: "Sales Director, Ray White Sydney",
    avatar: "/images/testimonial-1.jpg"
  },
  {
    quote: "The AI actually sounds natural. Callers often don't realize they're talking to an AI until we tell them. It's incredible.",
    author: "Michael Chen",
    title: "Principal, LJ Hooker",
    avatar: "/images/testimonial-2.jpg"
  },
  {
    quote: "Setup took 10 minutes. Within a day, we had qualified 15 leads that would have gone to voicemail before.",
    author: "Emma Williams",
    title: "Team Leader, McGrath Estate Agents",
    avatar: "/images/testimonial-3.jpg"
  }
];
```

---

## Pricing Section

### Layout (Placeholder - demo mode)

```tsx
function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free. Scale as you grow.
          </p>
        </div>

        <div className="mt-16 mx-auto max-w-lg">
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Demo Mode</CardTitle>
              <CardDescription>
                Full access to all features
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold">Free</div>
              <p className="text-muted-foreground">No credit card required</p>

              <ul className="mt-8 space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  Unlimited agents
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  Unlimited calls
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  All features included
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  Open source
                </li>
              </ul>

              <Button className="mt-8 w-full" size="lg" asChild>
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
```

---

## CTA Section

```tsx
function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-primary text-primary-foreground">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to never miss a call again?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Set up your AI voice agent in minutes. No credit card required.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8"
            asChild
          >
            <Link href="/dashboard">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

---

## Footer

```tsx
function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold">Voqo</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <Link href="https://github.com/your-repo" className="text-sm text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            Open source. Built with Next.js.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

---

## Images Required

| Image | Description | Size |
|-------|-------------|------|
| `/images/dashboard-preview.png` | Dashboard screenshot for hero | 1200x675 |
| `/images/step-1-configure.png` | Agent configuration screen | 600x400 |
| `/images/step-2-connect.png` | Phone connection screen | 600x400 |
| `/images/step-3-calls.png` | Call logs screen | 600x400 |
| `/images/testimonial-1.jpg` | Avatar placeholder | 64x64 |
| `/images/testimonial-2.jpg` | Avatar placeholder | 64x64 |
| `/images/testimonial-3.jpg` | Avatar placeholder | 64x64 |
| `/images/og-image.png` | Open Graph image | 1200x630 |

---

## SEO & Meta

```tsx
// app/(marketing)/layout.tsx
export const metadata: Metadata = {
  title: 'Voqo - AI Voice Agents for Real Estate',
  description: 'Never miss another call. AI voice agents that answer calls, qualify leads, and book appointments - 24/7.',
  openGraph: {
    title: 'Voqo - AI Voice Agents for Real Estate',
    description: 'Never miss another call. AI voice agents that answer calls, qualify leads, and book appointments - 24/7.',
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```
