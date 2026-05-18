import { useState } from 'react';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '@/hooks/use-locations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StarIcon, Trash2Icon } from 'lucide-react';
import toast from 'react-hot-toast';
import { HttpError } from '@/lib/http';
import type { UserLocationDto } from '@spacr/shared-types';

function LocationRow({
  location,
  onSetPrimary,
  onDelete,
}: {
  location: UserLocationDto;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{location.name}</span>
          {location.isPrimary && (
            <Badge variant="secondary" className="text-xs">
              Primary
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </p>
      </div>
      <div className="flex gap-2">
        {!location.isPrimary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetPrimary(location.id)}
            title="Set as primary"
          >
            <StarIcon size={16} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(location.id)}
          title="Delete location"
        >
          <Trash2Icon size={16} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function SettingsLocationsPage() {
  const { data, isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const [form, setForm] = useState({ name: '', lat: '', lng: '' });

  const locations = data?.locations ?? [];

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates.');
      return;
    }
    try {
      await createLocation.mutateAsync({ name: form.name, lat, lng });
      setForm({ name: '', lat: '', lng: '' });
      toast.success('Location added.');
    } catch (err) {
      if (err instanceof HttpError && err.status === 422) {
        toast.error('You have reached the 5-location limit.');
      } else {
        toast.error('Failed to add location.');
      }
    }
  }

  async function handleSetPrimary(id: string) {
    try {
      await updateLocation.mutateAsync({ id, data: { isPrimary: true } });
    } catch {
      toast.error('Failed to update primary location.');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteLocation.mutateAsync(id);
    } catch {
      toast.error('Failed to delete location.');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved locations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : locations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No locations saved yet.</p>
          ) : (
            <div className="divide-y">
              {locations.map((loc) => (
                <LocationRow
                  key={loc.id}
                  location={loc}
                  onSetPrimary={handleSetPrimary}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {locations.length < 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Add location</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Home, Work, …"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    placeholder="48.8566"
                    value={form.lat}
                    onChange={set('lat')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    placeholder="2.3522"
                    value={form.lng}
                    onChange={set('lng')}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={createLocation.isPending}>
                {createLocation.isPending ? 'Adding…' : 'Add location'}
              </Button>
            </form>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              {locations.length}/5 locations used. The primary location is used for ISS pass predictions and aurora alerts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
