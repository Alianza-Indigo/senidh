export function showInterventorPhotos() {
  const value = process.env.SHOW_INTERVENTOR_PHOTOS?.trim().toLowerCase();
  return !value || !["false", "0", "off", "no"].includes(value);
}
