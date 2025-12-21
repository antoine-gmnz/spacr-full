import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, X, Filter, Calendar, Building2 } from 'lucide-react';
import useDebounce from '@/hooks/useDebounce';

interface LaunchFiltersProps {
  onSearchChange: Dispatch<SetStateAction<string>>;
  onYearChange: Dispatch<SetStateAction<string>>;
  onAgencyChange?: Dispatch<SetStateAction<string>>;
  totalCount?: number;
  loadedCount?: number;
}

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() + i;
  return { label: year.toString(), value: year.toString() };
});

// Add past years too
const PAST_YEARS = Array.from({ length: 3 }, (_, i) => {
  const year = new Date().getFullYear() - i - 1;
  return { label: year.toString(), value: year.toString() };
}).reverse();

const ALL_YEARS = [...PAST_YEARS, ...YEARS];

const AGENCIES = [
  { label: 'SpaceX', value: 'SpaceX' },
  { label: 'NASA', value: 'NASA' },
  { label: 'ESA', value: 'ESA' },
  { label: 'Roscosmos', value: 'Roscosmos' },
  { label: 'CNSA (China)', value: 'CNSA' },
  { label: 'ISRO (India)', value: 'ISRO' },
  { label: 'JAXA (Japan)', value: 'JAXA' },
  { label: 'Rocket Lab', value: 'Rocket Lab' },
  { label: 'ULA', value: 'ULA' },
  { label: 'Blue Origin', value: 'Blue Origin' },
];

export function LaunchFilters({ 
  onSearchChange, 
  onYearChange, 
  onAgencyChange,
  totalCount,
  loadedCount 
}: LaunchFiltersProps) {
  const [searchInput, setSearchInput] = useState('');
  const [year, setYear] = useState('');
  const [agency, setAgency] = useState('');
  
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleYearChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setYear(newValue);
    onYearChange(newValue);
  };

  const handleAgencyChange = (value: string) => {
    const newValue = value === 'all' ? '' : value;
    setAgency(newValue);
    onAgencyChange?.(newValue);
  };

  const clearFilters = () => {
    setSearchInput('');
    setYear('');
    setAgency('');
    onSearchChange('');
    onYearChange('');
    onAgencyChange?.('');
  };

  const hasActiveFilters = searchInput || year || agency;

  return (
    <div className="bg-card rounded-sm p-4 border border-border/50">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <Label htmlFor="search" className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Search className="w-3 h-3" />
            Search Missions
          </Label>
          <div className="relative">
            <Input
              id="search"
              type="text"
              placeholder="Search by mission name, rocket, or provider..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-8"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Year Filter */}
        <div className="w-full lg:w-40">
          <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Year
          </Label>
          <Select value={year || 'all'} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {ALL_YEARS.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agency Filter */}
        {onAgencyChange && (
          <div className="w-full lg:w-48">
            <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              Agency
            </Label>
            <Select value={agency || 'all'} onValueChange={handleAgencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Agencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {AGENCIES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          {loadedCount !== undefined && totalCount !== undefined ? (
            <span>
              Showing <span className="text-foreground font-medium">{loadedCount}</span> of{' '}
              <span className="text-foreground font-medium">{totalCount}</span> launches
            </span>
          ) : (
            <span>Loading launches...</span>
          )}
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            {searchInput && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                "{searchInput}"
              </span>
            )}
            {year && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                {year}
              </span>
            )}
            {agency && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                {agency}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

