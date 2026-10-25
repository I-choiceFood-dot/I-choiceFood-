import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ArrowDown, ArrowLeft, ArrowRight, Bookmark, Check, ChefHat, Clock3, Heart, MapPin, Menu, Search, Star, Utensils, X } from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { getListFavoritesQueryKey, useAddFavorite, useListFavorites, useRemoveFavorite } from '@workspace/api-client-react';
import { categories, dishes, type Dish } from './recipeData';
import './index.css';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#d75b25',
    colorForeground: '#3e2c22',
    colorMutedForeground: '#806c5d',
    colorDanger: '#a94031',
    colorBackground: '#fbf5e9',
    colorInput: '#fffaf1',
    colorInputForeground: '#3e2c22',
    colorNeutral: '#dfd0ba',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '16px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fbf5e9] rounded-[24px] w-[440px] max-w-full overflow-hidden border border-[#e4d7c2] shadow-xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#3e2c22] font-bold',
    headerSubtitle: 'text-[#806c5d]',
    socialButtonsBlockButtonText: 'text-[#3e2c22] font-semibold',
    formFieldLabel: 'text-[#514033] font-semibold',
    footerActionLink: 'text-[#c95020] font-bold',
    footerActionText: 'text-[#806c5d]',
    dividerText: 'text-[#806c5d]',
    identityPreviewEditButton: 'text-[#c95020]',
    formFieldSuccessText: 'text-[#476747]',
    alertText: 'text-[#713e2e]',
    logoBox: 'rounded-xl overflow-hidden',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'border-[#dfd0ba] bg-[#fffaf1] hover:bg-[#f5ead8]',
    formButtonPrimary: 'bg-[#d75b25] hover:bg-[#bb491c] text-white font-bold shadow-none',
    formFieldInput: 'border-[#dfd0ba] bg-[#fffaf1] text-[#3e2c22]',
    footerAction: 'border-t border-[#eadfcd]',
    dividerLine: 'bg-[#dfd0ba]',
    alert: 'bg-[#f7e9dd] border-[#e8c8b2]',
    otpCodeFieldInput: 'border-[#dfd0ba] bg-[#fffaf1] text-[#3e2c22]',
    formFieldRow: 'text-[#3e2c22]',
    main: 'text-[#3e2c22]',
  },
};

type RecipeModalState = { dish: Dish; tab: 'ingredients' | 'steps' } | null;

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-lockup" aria-label="i-choice food home" data-testid="link-home-brand">
      <span className="brand-icon"><Utensils size={18} strokeWidth={2.5} /></span>
      {!compact && <span className="brand-name">i-choice<span>food</span></span>}
    </Link>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  return (
    <header className="site-header">
      <div className="header-inner">
        <BrandMark />
        <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <Link href="/" onClick={() => setMenuOpen(false)} data-testid="link-discover">Discover</Link>
          <Link href="/favorites" onClick={() => setMenuOpen(false)} data-testid="link-favorites"><Heart size={15} /> Saved dishes</Link>
          {!isLoaded ? <span className="nav-skeleton" /> : isSignedIn ? (
            <button className="nav-signin" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-signout">Sign out</button>
          ) : (
            <Link className="nav-signin" href="/sign-in" data-testid="link-signin">Sign in <ArrowRight size={15} /></Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function SampleNotice() {
  return (
    <div className="sample-notice" data-testid="notice-sample-data">
      <span className="sample-dot" />
      <span><strong>Sample listings</strong> — vendors, locations, ratings and prices are illustrative, not verified business information.</span>
    </div>
  );
}

function RecipeModal({ recipe, onClose, onTab }: { recipe: RecipeModalState; onClose: () => void; onTab: (tab: 'ingredients' | 'steps') => void }) {
  useEffect(() => {
    if (!recipe) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [recipe, onClose]);
  if (!recipe) return null;
  const { dish, tab } = recipe;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} data-testid="modal-recipe-backdrop">
      <section className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-title" data-testid={`modal-recipe-${dish.id}`}>
        <div className="modal-photo" style={{ backgroundImage: `url("${dish.image}")` }}>
          <button className="modal-close" onClick={onClose} aria-label="Close recipe" data-testid="button-close-recipe"><X size={19} /></button>
          <span className="modal-photo-tag"><ChefHat size={14} /> Cook this at home</span>
        </div>
        <div className="modal-content">
          <div className="modal-heading">
            <div><span className="eyebrow">{dish.category} · {dish.time}</span><h2 className="serif" id="recipe-title">{dish.name}</h2><p>{dish.subtitle}</p></div>
            <span className="serves-pill">{dish.serves}</span>
          </div>
          <div className="recipe-tabs" role="tablist" aria-label="Recipe content">
            <button className={tab === 'ingredients' ? 'recipe-tab active' : 'recipe-tab'} onClick={() => onTab('ingredients')} role="tab" aria-selected={tab === 'ingredients'} data-testid="tab-ingredients">Ingredients <span>{dish.ingredients.length}</span></button>
            <button className={tab === 'steps' ? 'recipe-tab active' : 'recipe-tab'} onClick={() => onTab('steps')} role="tab" aria-selected={tab === 'steps'} data-testid="tab-procedure">Cooking procedure <span>{dish.steps.length} steps</span></button>
          </div>
          {tab === 'ingredients' ? (
            <ul className="ingredient-list" data-testid={`list-ingredients-${dish.id}`}>
              {dish.ingredients.map((item) => <li key={item}><span className="ingredient-check"><Check size={13} /></span><span>{item}</span></li>)}
            </ul>
          ) : (
            <ol className="procedure-list" data-testid={`list-procedure-${dish.id}`}>
              {dish.steps.map((step, index) => <li key={step}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}
            </ol>
          )}
          <div className="modal-footer"><span><Clock3 size={15} /> {dish.time}</span><button className="button-secondary" onClick={() => onTab(tab === 'ingredients' ? 'steps' : 'ingredients')} data-testid="button-switch-recipe-tab">View {tab === 'ingredients' ? 'cooking procedure' : 'ingredients'} <ArrowRight size={15} /></button></div>
        </div>
      </section>
    </div>
  );
}

function useFavoriteActions() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const favoriteQuery = useListFavorites({ query: { enabled: !!isSignedIn, queryKey: getListFavoritesQueryKey(), retry: 1 } });
  const addFavorite = useAddFavorite({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() }) } });
  const removeFavorite = useRemoveFavorite({ mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() }) } });
  const favoriteIds = useMemo(() => new Set((favoriteQuery.data ?? []).map((favorite) => favorite.foodId)), [favoriteQuery.data]);
  function toggleFavorite(dish: Dish) {
    if (!isSignedIn) {
      setLocation('/sign-in');
      return;
    }
    if (favoriteIds.has(dish.id)) removeFavorite.mutate({ foodId: dish.id });
    else addFavorite.mutate({ data: { foodId: dish.id } });
  }
  return { favoriteQuery, favoriteIds, toggleFavorite, pending: addFavorite.isPending || removeFavorite.isPending };
}

function DishCard({ dish, isFavorite, pending, onFavorite, onRecipe }: { dish: Dish; isFavorite: boolean; pending: boolean; onFavorite: () => void; onRecipe: (tab: 'ingredients' | 'steps') => void }) {
  return (
    <article className="dish-card reveal" data-testid={`card-dish-${dish.id}`}>
      <div className="dish-image-wrap">
        <img src={dish.image} alt={`${dish.name}, Filipino dish`} className="dish-image" data-testid={`img-dish-${dish.id}`} loading="lazy" />
        <span className="dish-category">{dish.category}</span>
        <button className={`save-button ${isFavorite ? 'saved' : ''}`} onClick={onFavorite} disabled={pending} aria-label={isFavorite ? `Remove ${dish.name} from saved dishes` : `Save ${dish.name}`} aria-pressed={isFavorite} data-testid={`button-save-${dish.id}`}>
          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="dish-info">
        <div className="dish-title-row"><div><h3 className="serif">{dish.name}</h3><p className="dish-subtitle">{dish.subtitle}</p></div><div className="rating"><Star size={14} fill="currentColor" /><span>{dish.rating}</span></div></div>
        <div className="dish-meta">
          <span className="vendor-name">{dish.vendor}</span>
          <span className="location"><MapPin size={13} />{dish.location}</span>
        </div>
        <div className="card-bottom"><span className="price">{dish.price}<small> sample</small></span><span className="cook-time"><Clock3 size={13} />{dish.time}</span></div>
        <div className="recipe-actions">
          <button className="recipe-action" onClick={() => onRecipe('ingredients')} data-testid={`button-ingredients-${dish.id}`}><Utensils size={14} /> Ingredients</button>
          <button className="recipe-action action-primary" onClick={() => onRecipe('steps')} data-testid={`button-procedure-${dish.id}`}>Cooking procedure <ArrowRight size={14} /></button>
        </div>
      </div>
    </article>
  );
}

function DiscoveryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All dishes');
  const [recipe, setRecipe] = useState<RecipeModalState>(null);
  const { favoriteQuery, favoriteIds, toggleFavorite, pending } = useFavoriteActions();
  const filteredDishes = useMemo(() => dishes.filter((dish) => {
    const matchesCategory = category === 'All dishes' || dish.category === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [dish.name, dish.subtitle, dish.category, dish.vendor, dish.location].some((part) => part.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  }), [category, search]);

  return (
    <>
      <Header />
      <main>
        <section className="hero-wrap">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow"><span className="eyebrow-line" /> A little taste of home</span>
            <h1 className="serif">Find your next<br /><em>favorite</em> Filipino dish.</h1>
            <p>From the first spoonful to the last bite. Meet the classics, find a new craving, and bring the recipe home.</p>
            <a href="#discover-dishes" className="hero-cta" data-testid="link-explore-dishes">Find a dish <ArrowDown size={16} /></a>
            <div className="hero-footnote"><span className="hero-sun">+</span> Good food has a way of bringing us together.</div>
          </div>
          <div className="hero-art" aria-label="Chicken adobo with rice" role="img">
            <img src={dishes[0].image} alt="Glossy chicken adobo with rice" />
            <div className="hero-stamp"><span>lutong</span><strong>bahay</strong><i>comfort in every bite</i></div>
            <span className="hero-orbit orbit-one" /><span className="hero-orbit orbit-two" />
            <div className="hero-caption"><span>01 / 08</span><span>Made to be shared</span></div>
          </div>
          <div className="hero-side-note">FILIPINO FOOD, FOUND HERE</div>
        </section>
        <section className="discover-section" id="discover-dishes">
          <div className="section-kicker"><span>01</span><span className="kicker-rule" /> THE GOOD STUFF</div>
          <div className="section-heading">
            <div><h2 className="serif">What sounds <em>good?</em></h2><p>Big comfort, street-side favorites, and something sweet.</p></div>
            <Link className="saved-shortcut" href="/favorites" data-testid="link-view-saved"><Bookmark size={15} /> Your saved dishes <ArrowRight size={15} /></Link>
          </div>
          <SampleNotice />
          <div className="discovery-controls">
            <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes, cravings, or categories" aria-label="Search dishes" data-testid="input-search-dishes" />{search && <button onClick={() => setSearch('')} aria-label="Clear search" data-testid="button-clear-search"><X size={15} /></button>}</label>
            <span className="filter-label">Browse by</span>
            <div className="category-list" aria-label="Dish categories">
              {categories.map((name) => <button key={name} className={`category-chip ${category === name ? 'selected' : ''}`} onClick={() => setCategory(name)} aria-pressed={category === name} data-testid={`filter-category-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{name}</button>)}
            </div>
          </div>
          {favoriteQuery.isError && (
            <div className="inline-error" role="alert" data-testid="status-favorites-error">
              <span>Saved dishes could not load right now.</span><button onClick={() => favoriteQuery.refetch()} data-testid="button-retry-favorites">Try again</button>
            </div>
          )}
          <div className="results-line"><span>{search || category !== 'All dishes' ? 'MATCHING DISHES' : 'A FEW GOOD PLACES TO START'}</span><span>{filteredDishes.length} dishes <i /></span></div>
          {filteredDishes.length ? (
            <div className="dish-grid" data-testid="grid-dishes">
              {filteredDishes.map((dish) => <DishCard key={dish.id} dish={dish} isFavorite={favoriteIds.has(dish.id)} pending={pending} onFavorite={() => toggleFavorite(dish)} onRecipe={(tab) => setRecipe({ dish, tab })} />)}
            </div>
          ) : (
            <div className="empty-search" data-testid="empty-search-results"><span className="empty-mark"><Search size={22} /></span><h3 className="serif">Nothing on the menu yet.</h3><p>Try another dish or loosen up your filters.</p><button className="button-secondary" onClick={() => { setSearch(''); setCategory('All dishes'); }} data-testid="button-reset-search">Show all dishes <ArrowRight size={15} /></button></div>
          )}
        </section>
        <section className="recipe-callout">
          <div className="callout-mark"><ChefHat size={24} /></div>
          <div><span className="eyebrow">MORE THAN A MENU</span><h2 className="serif">The recipe is part of the story.</h2><p>Every dish comes with clear ingredients and a step-by-step walkthrough to help you make it your own.</p></div>
          <a href="#discover-dishes" className="callout-link" data-testid="link-browse-recipes">Find your first recipe <ArrowRight size={16} /></a>
        </section>
      </main>
      <Footer />
      <RecipeModal recipe={recipe} onClose={() => setRecipe(null)} onTab={(tab) => setRecipe((current) => current ? { ...current, tab } : current)} />
    </>
  );
}

function FavoritesPage() {
  const [recipe, setRecipe] = useState<RecipeModalState>(null);
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();
  const { favoriteQuery, favoriteIds, toggleFavorite, pending } = useFavoriteActions();
  useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation('/sign-in');
  }, [isLoaded, isSignedIn, setLocation]);
  if (!isLoaded || !isSignedIn || favoriteQuery.isLoading) return (
    <><Header /><main className="favorites-page"><div className="favorites-skeleton"><div className="skeleton-overline" /><div className="skeleton-title" /><div className="skeleton-grid">{[1, 2, 3].map((n) => <div className="skeleton-card" key={n}><span /><i /><b /></div>)}</div></div></main><Footer /></>
  );
  const savedDishes = dishes.filter((dish) => favoriteIds.has(dish.id));
  return (
    <>
      <Header />
      <main className="favorites-page">
        <div className="favorites-heading">
          <div className="section-kicker"><span>02</span><span className="kicker-rule" /> YOUR LITTLE RECIPE BOX</div>
          <div className="favorites-title-row"><div><h1 className="serif">Saved <em>for later.</em></h1><p>Your good-food list, all in one place.</p></div><Link className="back-link" href="/" data-testid="link-back-discover"><ArrowLeft size={15} /> Back to discovery</Link></div>
          <SampleNotice />
        </div>
        {favoriteQuery.isError ? (
          <div className="state-card error-state" role="alert" data-testid="status-favorites-page-error"><span className="state-icon"><Bookmark size={23} /></span><h2 className="serif">We couldn’t open your recipe box.</h2><p>Your saved dishes are still yours. Try loading them again.</p><button className="button-primary" onClick={() => favoriteQuery.refetch()} data-testid="button-retry-favorites-page">Retry loading</button></div>
        ) : savedDishes.length ? (
          <div className="dish-grid saved-grid" data-testid="grid-saved-dishes">{savedDishes.map((dish) => <DishCard key={dish.id} dish={dish} isFavorite={favoriteIds.has(dish.id)} pending={pending} onFavorite={() => toggleFavorite(dish)} onRecipe={(tab) => setRecipe({ dish, tab })} />)}</div>
        ) : (
          <div className="state-card empty-favorites" data-testid="empty-favorites"><span className="state-icon"><Heart size={24} /></span><span className="eyebrow">A FRESH START</span><h2 className="serif">Your recipe box is<br /><em>waiting for a favorite.</em></h2><p>Tap the heart on any dish that catches your eye. We’ll keep it right here.</p><Link href="/" className="button-primary" data-testid="link-discover-from-empty">Discover dishes <ArrowRight size={16} /></Link></div>
        )}
      </main>
      <Footer />
      <RecipeModal recipe={recipe} onClose={() => setRecipe(null)} onTab={(tab) => setRecipe((current) => current ? { ...current, tab } : current)} />
    </>
  );
}

function AuthPage({ type }: { type: 'sign-in' | 'sign-up' }) {
  return (
    <main className="auth-page">
      <div className="auth-side">
        <BrandMark />
        <div className="auth-message"><span className="eyebrow">A PLACE AT THE TABLE</span><h1 className="serif">Save the good<br /><em>stuff.</em></h1><p>Keep the dishes you love close, and find your way back to the recipes worth making again.</p><div className="auth-doodle"><span>HOME</span><span>IS</span><span>HERE</span></div></div>
        <span className="auth-foot">Good food. Good company. Always.</span>
      </div>
      <div className="auth-form-area"><Link className="auth-back" href="/" data-testid="link-auth-home"><ArrowLeft size={15} /> Back to discovery</Link>{type === 'sign-in' ? <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /> : <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />}</div>
    </main>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="footer-brand"><BrandMark /><span>Find it. Love it. Make it.</span></div><div className="footer-copy"><span>Food discovery, with a little more heart.</span><span>All listing details are sample data.</span></div></footer>;
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  return (
    <Switch>
      <Route path="/" component={DiscoveryPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/sign-in/*?" component={() => <AuthPage type="sign-in" />} />
      <Route path="/sign-up/*?" component={() => <AuthPage type="sign-up" />} />
      <Route>{() => <main className="not-found"><BrandMark /><span className="eyebrow">404 / NOT ON THE MENU</span><h1 className="serif">This page wandered<br />off for a snack.</h1><button className="button-primary" onClick={() => setLocation('/')} data-testid="button-return-home">Back to the good stuff <ArrowRight size={16} /></button></main>}</Route>
    </Switch>
  );
}

function ClerkWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Your saved dishes are waiting.' } },
        signUp: { start: { title: 'Pull up a chair', subtitle: 'Make a little room for your favorites.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <div className="app-shell grain"><AppRoutes /></div>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return <WouterRouter base={basePath}><ClerkWithRoutes /></WouterRouter>;
}

export default App;
