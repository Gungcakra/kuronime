import { after } from 'next/server';
import { jsonRoute } from '@/lib/upstream';
import { ensureCatalog, queryCatalog } from '@/lib/catalog';

// The first crawl of the catalogue takes ~10-20s; it runs after the response
export const maxDuration = 60;

export const GET = jsonRoute('explore', async params => {
  const { catalog, building, progress } = ensureCatalog();
  // Keep a serverless function alive until the (re)build finishes
  if (building) after(() => building);
  // Nothing indexed yet: the client polls until the first build lands
  if (!catalog) return { building: true, progress };
  return queryCatalog(catalog, params);
});
