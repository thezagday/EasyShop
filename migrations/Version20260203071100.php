<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260203071100 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE obstacles (id INT AUTO_INCREMENT NOT NULL, shop_id INT NOT NULL, x INT NOT NULL, y INT NOT NULL, width INT NOT NULL, height INT NOT NULL, type VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_A7A4F34C4D16C4DD (shop_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE obstacles ADD CONSTRAINT FK_A7A4F34C4D16C4DD FOREIGN KEY (shop_id) REFERENCES shop (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE obstacles DROP FOREIGN KEY FK_A7A4F34C4D16C4DD');
        $this->addSql('DROP TABLE obstacles');
    }
}
