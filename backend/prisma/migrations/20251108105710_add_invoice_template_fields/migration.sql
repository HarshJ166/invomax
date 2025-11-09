-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "state_code" TEXT;

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "email" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "state_code" TEXT;

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "batch" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "buyer_order_date" DATE,
ADD COLUMN     "buyer_order_no" TEXT,
ADD COLUMN     "delivery_note" TEXT,
ADD COLUMN     "delivery_note_date" DATE,
ADD COLUMN     "despatch_document_no" TEXT,
ADD COLUMN     "despatched_through" TEXT,
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "e_way_bill_no" TEXT,
ADD COLUMN     "mode_terms_of_payment" TEXT,
ADD COLUMN     "other_references" TEXT,
ADD COLUMN     "supplier_ref" TEXT,
ADD COLUMN     "terms_of_delivery" TEXT;
