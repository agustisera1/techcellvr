-- Migration: 0005_storage
-- Creates the product-images Storage bucket with public read access.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read (catalog needs images without auth)
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Any authenticated request can upload (dev; tighten for production)
create policy "product_images_auth_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

-- Any authenticated request can delete
create policy "product_images_auth_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images');
