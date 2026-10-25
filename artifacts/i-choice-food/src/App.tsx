import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Bookmark, Check, ChefHat, Clock3, Heart, Map, MapPin, Menu, Navigation, Search, Utensils, X } from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { categories, dishes, type Dish } from './recipeData';
import './index.css';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const FAVORITES_STORAGE_KEY = 'i-choice-food:saved-dishes';

type RecipeModalState = { dish: Dish; tab: 'ingredients' | 'steps' } | null;
type LocationChoice = { query: string; label: string } | null;
type FavoritesContextValue = { favoriteIds: Set<string>; toggleFavorite: (dish: Dish) => void; storageAvailable: boolean };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function mapsSearchUrl(searchTerm: string, location: LocationChoice) {
  if (!location) return '';
  const foodSearch = searchTerm.trim() || 'restaurants carinderias eateries Filipino street food';
  const query = `${foodSearch} near ${location.query}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

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
        </nav>
      </div>
    </header>
  );
}

function SampleNotice() {
  return (
    <div className="sample-notice" data-testid="notice-sample-data">
      <span className="sample-dot" />
      <span><strong>Sample recipe cards</strong> — place names and prices are examples, not verified businesses. No business ratings or opening hours are shown. Google Maps opens a separate search.</span>
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

function readFavorites() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]');
    return {
      ids: Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string') : [],
      available: true,
    };
  } catch {
    return { ids: [] as string[], available: false };
  }
}

function FavoritesProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readFavorites);
  const [savedIds, setSavedIds] = useState(initial.ids);
  const [storageAvailable, setStorageAvailable] = useState(initial.available);
  const favoriteIds = useMemo(() => new Set(savedIds), [savedIds]);
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(savedIds));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [savedIds]);
  function toggleFavorite(dish: Dish) {
    setSavedIds((current) => current.includes(dish.id)
      ? current.filter((id) => id !== dish.id)
      : [...current, dish.id]);
  }
  return <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, storageAvailable }}>{children}</FavoritesContext.Provider>;
}

function useFavoriteActions() {
  const favorites = useContext(FavoritesContext);
  if (!favorites) throw new Error('FavoritesProvider is required.');
  return { ...favorites, pending: false };
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
        <div className="dish-title-row"><div><h3 className="serif">{dish.name}</h3><p className="dish-subtitle">{dish.subtitle}</p></div></div>
        <div className="dish-meta">
          <span className="vendor-name">Example place: {dish.vendor}</span>
          <span className="location"><MapPin size={13} />Sample area: {dish.location}</span>
        </div>
        <div className="card-bottom"><span className="price">{dish.price}<small> example price</small></span><span className="cook-time"><Clock3 size={13} />{dish.time}</span></div>
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
  const [manualLocation, setManualLocation] = useState('');
  const [mapLocation, setMapLocation] = useState<LocationChoice>(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const { favoriteIds, toggleFavorite, pending, storageAvailable } = useFavoriteActions();
  const nearbyMapsUrl = mapsSearchUrl(search, mapLocation);
  function requestCurrentLocation() {
    if (!navigator.geolocation) {
      setMapLocation(null);
      setLocationMessage('GPS is not available in this browser or page context. Enter a city, barangay, or address below instead.');
      return;
    }
    setIsLocating(true);
    setMapLocation(null);
    setLocationMessage('Requesting location permission…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const query = `${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`;
        setMapLocation({ query, label: 'your current location' });
        setLocationMessage('Location ready. This app does not save your coordinates; they are included only when you open the Google Maps search.');
        setIsLocating(false);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. No problem—search by city, barangay, or address below.'
          : error.code === error.TIMEOUT
            ? 'GPS took too long to respond. Try again or enter a location manually below.'
            : 'Your location could not be determined. Try again or enter a location manually below.';
        setLocationMessage(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
    );
  }
  function useManualLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = manualLocation.trim();
    if (!query) {
      setLocationMessage('Enter a city, barangay, or address to search manually.');
      return;
    }
    setMapLocation({ query, label: query });
    setLocationMessage(`Ready to search around ${query} on Google Maps.`);
  }
  const filteredDishes = useMemo(() => dishes.filter((dish) => {
    const matchesCategory = category === 'All dishes' || dish.category === category;
    const query = search.trim().toLowerCase();
    const searchableParts = [dish.name, dish.subtitle, dish.category, dish.vendor, dish.location, 'restaurant restaurants carinderia carinderias eatery eateries street food filipino food'];
    const matchesSearch = !query || searchableParts.some((part) => part.toLowerCase().includes(query));
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
            <div className="hero-caption"><span>01 / 09</span><span>Made to be shared</span></div>
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
          {!storageAvailable && <p className="storage-warning" role="status">Browser storage is unavailable. Favorites stay in memory only until this browser tab is reloaded or closed.</p>}
          <section className="nearby-panel" aria-labelledby="nearby-title" data-testid="panel-nearby-search">
            <div className="nearby-copy">
              <span className="eyebrow"><MapPin size={13} /> REAL PLACES, SEARCHED ON MAPS</span>
              <h3 className="serif" id="nearby-title">Find food around you.</h3>
              <p>Use GPS or enter a location. Nearby businesses and their details are shown by Google Maps—not mixed with these sample recipe cards.</p>
            </div>
            <div className="nearby-actions">
              <div className="nearby-buttons">
                <button className="button-secondary" onClick={requestCurrentLocation} disabled={isLocating} data-testid="button-near-me"><Navigation size={15} />{isLocating ? 'Finding you…' : 'Near me'}</button>
                <button className="button-primary" onClick={() => nearbyMapsUrl && window.open(nearbyMapsUrl, '_blank', 'noopener,noreferrer')} disabled={!mapLocation || isLocating} data-testid="button-google-maps"><Map size={15} /> Find Nearby Food on Google Maps</button>
              </div>
              <form className="manual-location-form" onSubmit={useManualLocation}>
                <label className="search-box"><MapPin size={17} /><input value={manualLocation} onChange={(event) => setManualLocation(event.target.value)} placeholder="City, barangay, or address" aria-label="Search location manually" data-testid="input-manual-location" /></label>
                <button className="location-submit" type="submit" data-testid="button-use-location">Use location</button>
              </form>
              <p className={`location-message ${locationMessage && !mapLocation ? 'location-message-error' : ''}`} role="status" aria-live="polite" data-testid="status-location">
                {locationMessage || 'GPS is optional. Manual location search works if permission is denied.'}
              </p>
              {mapLocation && <p className="location-selected" data-testid="selected-location"><Check size={13} /> Search area: {mapLocation.label}</p>}
            </div>
          </section>
          <div className="discovery-controls">
            <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search food, restaurant name, or location" aria-label="Search food, restaurant name, or location" data-testid="input-search-dishes" />{search && <button onClick={() => setSearch('')} aria-label="Clear search" data-testid="button-clear-search"><X size={15} /></button>}</label>
            <span className="filter-label">Browse by</span>
            <div className="category-list" aria-label="Dish categories">
              {categories.map((name) => <button key={name} className={`category-chip ${category === name ? 'selected' : ''}`} onClick={() => setCategory(name)} aria-pressed={category === name} data-testid={`filter-category-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{name}</button>)}
            </div>
          </div>
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
  const { favoriteIds, toggleFavorite, pending, storageAvailable } = useFavoriteActions();
  const savedDishes = dishes.filter((dish) => favoriteIds.has(dish.id));
  return (
    <>
      <Header />
      <main className="favorites-page">
        <div className="favorites-heading">
          <div className="section-kicker"><span>02</span><span className="kicker-rule" /> YOUR LITTLE RECIPE BOX</div>
          <div className="favorites-title-row"><div><h1 className="serif">Saved <em>for later.</em></h1><p>Your good-food list, all in one place.</p></div><Link className="back-link" href="/" data-testid="link-back-discover"><ArrowLeft size={15} /> Back to discovery</Link></div>
          <SampleNotice />
          <p className="storage-note" data-testid="note-local-favorites">Favorites are saved only in this browser on this device. They are not synced to an account.</p>
          {!storageAvailable && <p className="storage-warning" role="status">Browser storage is unavailable. Favorites stay in memory only until this browser tab is reloaded or closed.</p>}
        </div>
        {savedDishes.length ? (
          <div className="dish-grid saved-grid" data-testid="grid-saved-dishes">{savedDishes.map((dish) => <DishCard key={dish.id} dish={dish} isFavorite={favoriteIds.has(dish.id)} pending={pending} onFavorite={() => toggleFavorite(dish)} onRecipe={(tab) => setRecipe({ dish, tab })} />)}</div>
        ) : (
          <div className="state-card empty-favorites" data-testid="empty-favorites"><span className="state-icon"><Heart size={24} /></span><span className="eyebrow">A FRESH START</span><h2 className="serif">Your recipe box is<br /><em>waiting for a favorite.</em></h2><p>Tap the heart on any dish that catches your eye. Favorites stay in this browser and on this device.</p><Link href="/" className="button-primary" data-testid="link-discover-from-empty">Discover dishes <ArrowRight size={16} /></Link></div>
        )}
      </main>
      <Footer />
      <RecipeModal recipe={recipe} onClose={() => setRecipe(null)} onTab={(tab) => setRecipe((current) => current ? { ...current, tab } : current)} />
    </>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="footer-brand"><BrandMark /><span>Find it. Love it. Make it.</span></div><div className="footer-copy"><span>Food discovery, with a little more heart.</span><span>Recipe cards are examples; Google Maps searches real places.</span><span>Favorites stay in this browser and on this device.</span></div></footer>;
}

function AppRoutes() {
  const [, setLocation] = useLocation();
  return (
    <Switch>
      <Route path="/" component={DiscoveryPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route>{() => <main className="not-found"><BrandMark /><span className="eyebrow">404 / NOT ON THE MENU</span><h1 className="serif">This page wandered<br />off for a snack.</h1><button className="button-primary" onClick={() => setLocation('/')} data-testid="button-return-home">Back to the good stuff <ArrowRight size={16} /></button></main>}</Route>
    </Switch>
  );
}

function App() {
  return <WouterRouter base={basePath}><FavoritesProvider><div className="app-shell grain"><AppRoutes /></div></FavoritesProvider></WouterRouter>;
}

export default App;
