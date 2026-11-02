export type InterventorPhotoVariant = "directory" | "profile" | "credential";

export function interventorPhotoVersion(updatedAt: Date | string) {
  const timestamp = updatedAt instanceof Date ? updatedAt.getTime() : new Date(updatedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp.toString(36) : "1";
}

export function interventorPhotoUrl(id: number, updatedAt: Date | string, variant: InterventorPhotoVariant) {
  const query = new URLSearchParams({ variant, v: interventorPhotoVersion(updatedAt) });
  return `/api/media/interventores/${id}?${query.toString()}`;
}
