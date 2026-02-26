-- Create a bucket for attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('ppe_attachments', 'ppe_attachments', true);

-- Allow public uploads
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ppe_attachments');

-- Allow public read access
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'ppe_attachments');
