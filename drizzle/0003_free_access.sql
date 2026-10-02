ALTER TABLE "customers" ADD COLUMN "free_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "orders_free_idx" ON "orders" USING btree ("is_free");