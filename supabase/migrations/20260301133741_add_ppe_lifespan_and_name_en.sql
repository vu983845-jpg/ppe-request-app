ALTER TABLE "public"."ppe_master"
ADD COLUMN "life_span_months" integer DEFAULT 0 NOT NULL,
ADD COLUMN "name_en" varchar(255);

-- Update existing records so name_en defaults to the current name (Vietnamese) initially.
UPDATE "public"."ppe_master" SET "name_en" = "name" WHERE "name_en" IS NULL;
