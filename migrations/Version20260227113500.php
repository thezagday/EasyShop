<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260227113500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add image_file column to shop_banner for admin uploaded banner images';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE shop_banner ADD image_file VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE shop_banner DROP image_file');
    }
}
