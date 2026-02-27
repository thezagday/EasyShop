<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260227110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create shop_banner table for map advertisement placements';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE shop_banner (id INT AUTO_INCREMENT NOT NULL, shop_id INT NOT NULL, title VARCHAR(255) NOT NULL, image_url VARCHAR(1024) DEFAULT NULL, target_url VARCHAR(1024) DEFAULT NULL, x_coordinate DOUBLE PRECISION DEFAULT NULL, y_coordinate DOUBLE PRECISION DEFAULT NULL, active TINYINT(1) DEFAULT 1 NOT NULL, sort_order INT DEFAULT 0 NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_SHOP_BANNER_SHOP (shop_id), INDEX IDX_SHOP_BANNER_ACTIVE (active), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE shop_banner ADD CONSTRAINT FK_SHOP_BANNER_SHOP FOREIGN KEY (shop_id) REFERENCES shop (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE shop_banner DROP FOREIGN KEY FK_SHOP_BANNER_SHOP');
        $this->addSql('DROP TABLE shop_banner');
    }
}
