ALTER TABLE `orders` MODIFY COLUMN `status` enum('new','pending_approval','approved','in_progress','completed','delayed','cancelled') NOT NULL DEFAULT 'new';--> statement-breakpoint
ALTER TABLE `orders` ADD `progress` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `estimatedPrice` int;--> statement-breakpoint
ALTER TABLE `orders` ADD `adminNotes` text;--> statement-breakpoint
ALTER TABLE `portfolioWorks` ADD `price` int;