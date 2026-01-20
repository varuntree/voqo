# UI Design Specification

## Overview
The UI follows Square's design language, adapted for an AI voice agent platform. Built with Next.js, Shadcn/ui, and Tailwind CSS.

---

## Design Principles

1. **Clean & Professional** - Minimal visual noise, focus on content
2. **Consistent** - Same patterns throughout the app
3. **Responsive** - Works on desktop and mobile
4. **Accessible** - WCAG 2.1 AA compliant

---

## Color Palette (Square-inspired)

### Primary Colors
```css
--background: 0 0% 100%;           /* #FFFFFF - White */
--foreground: 0 0% 9%;             /* #171717 - Near black */

--primary: 0 0% 9%;                /* #171717 - Black */
--primary-foreground: 0 0% 100%;  /* #FFFFFF - White */
```

### Secondary Colors
```css
--secondary: 0 0% 96%;             /* #F5F5F5 - Light gray */
--secondary-foreground: 0 0% 9%;  /* #171717 - Black */

--muted: 0 0% 96%;                 /* #F5F5F5 */
--muted-foreground: 0 0% 45%;     /* #737373 - Gray */
```

### Accent Colors
```css
--accent: 221 83% 53%;             /* #3B82F6 - Blue (links, actions) */
--accent-foreground: 0 0% 100%;

--destructive: 0 84% 60%;          /* #EF4444 - Red (errors, delete) */
--destructive-foreground: 0 0% 100%;

--success: 142 76% 36%;            /* #22C55E - Green */
--warning: 38 92% 50%;             /* #F59E0B - Amber */
```

### Borders & Cards
```css
--border: 0 0% 90%;                /* #E5E5E5 */
--input: 0 0% 90%;
--ring: 0 0% 9%;

--card: 0 0% 100%;
--card-foreground: 0 0% 9%;
```

---

## Typography

### Font Family
```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

### Scale
```css
/* Headings */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; font-weight: 600; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; font-weight: 600; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; font-weight: 500; }

/* Body */
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
```

---

## Spacing

Based on 4px grid:
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

---

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - buttons, inputs */
--radius-md: 0.5rem;    /* 8px - cards */
--radius-lg: 0.75rem;   /* 12px - modals */
--radius-full: 9999px;  /* Pills, avatars */
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

---

## Layout Structure

### Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│ Sidebar (240px)          │ Main Content                   │
│                          │                                │
│ Logo                     │ Header                         │
│                          │ ┌────────────────────────────┐ │
│ Navigation               │ │ Page Title        Actions  │ │
│ - Dashboard              │ └────────────────────────────┘ │
│ - Agents                 │                                │
│ - Contacts               │ Content Area                   │
│ - Call Logs              │                                │
│ - Campaigns              │                                │
│ - Settings               │                                │
│                          │                                │
│                          │                                │
│                          │                                │
│ ─────────────────        │                                │
│ Workspace info           │                                │
└────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (1024px+)**: Sidebar visible, full layout
- **Tablet (768px-1023px)**: Collapsible sidebar
- **Mobile (<768px)**: Bottom navigation or hamburger menu

---

## Components

### Sidebar

```tsx
function Sidebar() {
  return (
    <div className="flex h-screen w-60 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Logo className="h-8" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        <NavItem href="/dashboard" icon={Home}>Dashboard</NavItem>
        <NavItem href="/dashboard/agents" icon={Bot}>Agents</NavItem>
        <NavItem href="/dashboard/contacts" icon={Users}>Contacts</NavItem>
        <NavItem href="/dashboard/calls" icon={Phone}>Call Logs</NavItem>
        <NavItem href="/dashboard/campaigns" icon={Megaphone}>Campaigns</NavItem>
        <NavItem href="/dashboard/settings" icon={Settings}>Settings</NavItem>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-sm text-muted-foreground">
          Single User Mode
        </div>
      </div>
    </div>
  );
}
```

### Page Header

```tsx
function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
```

### Data Table

```tsx
function DataTable({
  columns,
  data,
  onRowClick
}: DataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(row => (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(col => (
                <TableCell key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Stats Card

```tsx
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-full bg-primary/10 p-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        {trend && (
          <div className={cn(
            "mt-2 text-xs",
            trend.direction === 'up' ? 'text-success' : 'text-destructive'
          )}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Empty State

```tsx
function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

### Status Badge

```tsx
const statusStyles = {
  completed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  pending: 'bg-muted text-muted-foreground',
  running: 'bg-accent/10 text-accent',
  enabled: 'bg-success/10 text-success',
  disabled: 'bg-muted text-muted-foreground',
};

function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
      statusStyles[status]
    )}>
      {status}
    </span>
  );
}
```

---

## Page Layouts

### List Page Pattern

```tsx
function ListPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Contacts"
        description="Manage your contacts"
        actions={
          <>
            <Button variant="outline">Import CSV</Button>
            <Button>Add Contact</Button>
          </>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Input placeholder="Search..." className="max-w-sm" />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>...</SelectContent>
          </Select>
        </div>

        {/* Content */}
        {data.length > 0 ? (
          <>
            <DataTable columns={columns} data={data} />
            <Pagination className="mt-4" />
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Add your first contact to get started"
            action={<Button>Add Contact</Button>}
          />
        )}
      </div>
    </div>
  );
}
```

### Detail Page Pattern

```tsx
function DetailPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/contacts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <span>John Smith</span>
          </div>
        }
        actions={
          <>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="destructive">Delete</Button>
          </>
        }
      />

      <div className="p-6 space-y-6">
        {/* Sections as Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>...</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memories</CardTitle>
          </CardHeader>
          <CardContent>...</CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## Forms

### Form Pattern

```tsx
function AgentForm() {
  const form = useForm({
    resolver: zodResolver(agentSchema),
    defaultValues: { ... }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Display name for this agent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* More fields... */}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Modals & Dialogs

### Confirmation Dialog

```tsx
function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Loading States

### Skeleton Pattern

```tsx
function ContactListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Full Page Loading

```tsx
function PageLoading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
```

---

## Toasts & Notifications

```tsx
// Success
toast.success("Contact saved successfully");

// Error
toast.error("Failed to save contact");

// With description
toast("Call completed", {
  description: "Duration: 2m 25s"
});

// With action
toast("New call received", {
  action: {
    label: "View",
    onClick: () => router.push(`/dashboard/calls/${callId}`)
  }
});
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + K` | Open command palette (future) |
| `⌘ + N` | New item (context-aware) |
| `Escape` | Close modal/dialog |
| `⌘ + S` | Save form |

---

## Animations

```css
/* Page transitions */
.page-enter { opacity: 0; transform: translateY(8px); }
.page-enter-active { opacity: 1; transform: translateY(0); transition: all 150ms ease-out; }

/* Hover effects */
.hover-lift { transition: transform 150ms ease; }
.hover-lift:hover { transform: translateY(-2px); }

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin { animation: spin 1s linear infinite; }
```
